// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions, Profile, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";

import { publicAxios } from "@/shared/libs/axios";

// --- Type Declarations for NextAuth ---
// Extends the default types to include our custom token properties.

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: User;
    error?: "RefreshAccessTokenError";
  }
  interface User {
    id: number;
    nickname: string;
    email: string;
    profileImageUrl: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires: number;
    user: User;
    error?: "RefreshAccessTokenError";
  }
}

// --- 헬퍼 함수들 ---

interface SocialLoginDto {
  provider: string;
  providerId: string;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
}

/**
 * JWT 토큰의 만료시간을 구하기 위해 디코드합니다.
 * @param token The JWT string.
 * @returns The expiration timestamp in milliseconds.
 */
function getExpirationFromJwt(token: string): number {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = Buffer.from(payloadBase64, "base64").toString();
    const decoded = JSON.parse(decodedJson);

    return decoded.exp * 1000;
  } catch (error) {
    return 0;
  }
}

/**
 * refresh token을 활용해 access token을 갱신합니다.
 * @param token
 * @returns 새로운 JWT 객체
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const { data } = await publicAxios.post(
      "/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    );

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      accessTokenExpires: getExpirationFromJwt(data.accessToken),
      error: undefined, // 이전 에러가 있다면 클리어
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// --- AuthOptions 환경 설정 ---

/**
 * 중복 토큰 재발급을 방지하기 위한 변수입니다.
 * 재발급 요청이 진행 중일 때, 해당 요청의 Promise를 저장합니다.
 */
let refreshTokenPromise: Promise<JWT> | null = null;

const authOptions: AuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID ?? "",
      clientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // JWT Callback: JWT 값이 생성되거나 수정될때 매번 호출됩니다.
    async jwt({ token, account, profile }): Promise<JWT> {
      // 최초 로그인
      if (account && profile) {
        let socialLoginDto: SocialLoginDto | null = null;

        switch (account.provider) {
          case "kakao":
            const kakaoProfile = profile as any;
            socialLoginDto = {
              provider: account.provider,
              providerId: account.providerAccountId,
              nickname: kakaoProfile.properties?.nickname ?? "카카오 유저",
              email: kakaoProfile.kakao_account?.email,
              profileImageUrl: kakaoProfile.properties?.profile_image,
            };
            break;
          case "naver":
            const naverProfile = profile as any;
            socialLoginDto = {
              provider: account.provider,
              providerId:
                naverProfile.response?.id ?? account.providerAccountId,
              nickname: naverProfile.response?.nickname ?? "네이버 유저",
              email: naverProfile.response?.email,
              profileImageUrl: naverProfile.response?.profile_image,
            };
            break;
          default:
            throw new Error("Unsupported provider");
        }

        try {
          const { data } = await publicAxios.post(
            "/auth/social-login",
            socialLoginDto
          );

          token.accessToken = data.accessToken;
          token.refreshToken = data.refreshToken;
          token.accessTokenExpires = getExpirationFromJwt(data.accessToken);
          token.user = data.user;
          return token;
        } catch (error) {
          console.error("Error during social login with backend:", error);
          token.error = "RefreshAccessTokenError";
          return token;
        }
      }

      // 토큰이 아직 유효한 경우, 그대로 반환
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // 토큰이 만료되었고, 현재 다른 곳에서 재발급 중이라면 그 요청을 기다림
      if (refreshTokenPromise) {
        console.log("Refresh already in progress, waiting...");
        return await refreshTokenPromise;
      }

      // 토큰이 만료되었고, 재발급 중인 요청도 없다면 새로운 재발급 요청 시작
      console.log("Access token expired, attempting to refresh...");
      refreshTokenPromise = refreshAccessToken(token);

      try {
        // 방금 시작한 재발급 요청을 기다려 결과를 반환
        return await refreshTokenPromise;
      } finally {
        // 재발급 요청이 성공하든 실패하든, 다음 재발급을 위해 Promise를 초기화
        refreshTokenPromise = null;
      }
    },

    // 클라이언트가 세션 데이터에 접근할 때 호출됩니다.
    async session({ session, token }): Promise<any> {
      session.accessToken = token.accessToken;
      session.user = token.user;
      session.error = token.error;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

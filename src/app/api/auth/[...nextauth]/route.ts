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
    // 1. JWT Callback: JWT 값이 생성되거나 수정될때 매번 호출됩니다.
    async jwt({ token, account, profile }): Promise<JWT> {
      /**
       * 최초 로그인 시에만 `account` 과 `profile`값이 존재합니다.
       * 최초 로그인 후 nest 서버로부터 토큰을 받아와 저장합니다.
       */
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
          // Nest 백엔드 서버의 social-login api를 호출합니다.
          const { data } = await publicAxios.post(
            "/auth/social-login",
            socialLoginDto
          );

          // 서버로부터 응답된 토큰정보를 NextAuth 토큰정보에 저장합니다.
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

      // 최초 로그인 이후 세션에 접근 시, 토큰이 만료되었는지 체크합니다
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // 토큰이 만료되었으면 새로 토큰을 발급받아 리턴합니다.
      console.log("Access token expired, attempting to refresh...");
      const newJWT = await refreshAccessToken(token);
      return newJWT;
    },

    // 클라이언트가 세션 데이터에 접근할 때 호출됩니다.
    async session({ session, token }): Promise<any> {
      // 클라이언트 사이드 세션 객체에 JWT 객체의 최신 토큰정보를 반환합니다.
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

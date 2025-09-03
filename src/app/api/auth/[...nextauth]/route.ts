// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";

// NestJS 서버의 SocialLoginDto와 형식을 맞춥니다.
interface SocialLoginDto {
  provider: string;
  providerId: string;
  nickname: string;
  email?: string;
  profileImageUrl?: string;
}

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
    // signIn 콜백은 거의 사용하지 않으며, 특정 조건으로 로그인을 막을 때 사용합니다.
    // async signIn({ user, account, profile }) {
    //   if (someCondition) return false // 로그인 거부
    //   return true // 로그인 허용
    // },

    // ⭐️ 핵심 로직: 소셜 로그인 성공 후 실행되며, JWT를 생성/업데이트합니다.
    async jwt({ token, account, profile }): Promise<JWT> {
      // account와 profile 객체는 "최초 로그인 시"에만 존재합니다.
      if (account && profile) {
        let socialLoginDto: SocialLoginDto | null = null;

        // 1. 프로바이더에 따라 데이터를 DTO 형식으로 정규화합니다.
        switch (account.provider) {
          case "kakao": {
            // 카카오 프로필 타입 정의 (필요에 따라 더 상세하게 정의 가능)
            const kakaoProfile = profile as {
              properties?: { nickname: string; profile_image: string };
              kakao_account?: { email?: string };
            };
            socialLoginDto = {
              provider: account.provider,
              providerId: account.providerAccountId,
              nickname: kakaoProfile.properties?.nickname ?? "카카오 유저",
              email: kakaoProfile.kakao_account?.email,
              profileImageUrl: kakaoProfile.properties?.profile_image,
            };
            break;
          }
          case "naver": {
            // 네이버 프로필 타입 정의
            const naverProfile = profile as {
              response?: {
                id: string;
                nickname: string;
                profile_image: string;
                email?: string;
              };
            };
            socialLoginDto = {
              provider: account.provider,
              providerId:
                naverProfile.response?.id ?? account.providerAccountId,
              nickname: naverProfile.response?.nickname ?? "네이버 유저",
              email: naverProfile.response?.email,
              profileImageUrl: naverProfile.response?.profile_image,
            };
            break;
          }
          default:
            throw new Error("Unsupported provider");
        }

        try {
          // 2. NestJS 백엔드 서버에 소셜 로그인 정보를 전송합니다.
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/social-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(socialLoginDto),
            }
          );

          if (!res.ok) {
            throw new Error("Failed to login with backend");
          }

          const nestAuthResponse = await res.json();

          // 3. 백엔드에서 받은 토큰과 유저 정보를 NextAuth 토큰에 합칩니다.
          // 이 데이터는 아래 session 콜백의 'token' 파라미터로 전달됩니다.
          token.accessToken = nestAuthResponse.accessToken;
          token.refreshToken = nestAuthResponse.refreshToken;
          token.user = nestAuthResponse.user;
        } catch (error) {
          console.error("Error during social login with backend:", error);
          // 에러 발생 시 토큰에 에러 정보를 담아 반환할 수 있습니다.
          token.error = "SocialLoginError";
        }
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      // url: 로그인 후 리디렉션될 경로입니다. (callbackUrl이 있다면 그 값이 들어옵니다.)
      // baseUrl: 우리 웹사이트의 기본 주소입니다.

      // 1. callbackUrl이 상대 경로('/'로 시작)인 경우, 절대 경로로 만들어 반환합니다.
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // 2. callbackUrl이 우리 웹사이트의 주소와 동일한 출처(origin)를 갖는 경우, 그대로 반환합니다.
      // (외부 URL 리디렉션 방지)
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // 3. 그 외의 모든 경우 (예: 사용자가 로그인 페이지로 직접 들어온 경우), 기본 URL로 보냅니다.
      return baseUrl;
    },

    // ⭐️ 최종 단계: 클라이언트에서 `useSession()` 등으로 세션 정보를 조회할 때마다 실행됩니다.
    async session({ session, token }): Promise<any> {
      // jwt 콜백에서 처리한 토큰 데이터를 최종 세션 객체에 담아줍니다.
      // 이 과정을 거쳐야 클라이언트에서 session.accessToken 등으로 접근할 수 있습니다.
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).user = token.user;
      (session as any).error = token.error;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

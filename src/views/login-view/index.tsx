"use client";

import { Logo } from "@/layouts/common/logo";
import { signIn } from "next-auth/react";
import Image from "next/image";

export const LoginView = () => {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-8 mx-4 space-y-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            시작하기
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            SNS 계정으로 3초만에 간편하게 로그인하세요.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => signIn("kakao")}>
            <Image
              src="/imgs/kakao_login.png"
              alt="카카오 로그인"
              width={366}
              height={60}
              priority
            />
          </button>
          <button onClick={() => signIn("naver")}>
            <Image
              src="/imgs/naver_login.png"
              alt="네이버 로그인"
              width={366}
              height={60}
              priority
            />
          </button>
        </div>

        <p className="px-8 text-xs text-center text-gray-500">
          로그인은{" "}
          <a href="/terms" className="underline hover:text-gray-700">
            이용약관
          </a>{" "}
          및{" "}
          <a href="/privacy" className="underline hover:text-gray-700">
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
};

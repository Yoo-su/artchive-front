/* =================================================================
  - 인증이 필요한 페이지들을 보호하는 미들웨어입니다.
  - 요청이 페이지에 도달하기 전에 실행되어 로그인 상태를 확인합니다.
  - 로그인한 사용자가 /login 페이지 접근 시 /home으로 리디렉션합니다.
  =================================================================
*/
import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  // `withAuth`는 인증된 사용자만 접근을 허용하는 미들웨어 함수를 강화합니다.
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 로그인한 사용자가 /login 페이지에 접근하는 경우 /home으로 리디렉션
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // 이 콜백은 토큰이 유효한 경우에만 true를 반환합니다.
      // true를 반환해야 위의 middleware 함수가 실행됩니다.
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // /login 페이지는 항상 접근 허용 (위의 middleware 함수에서 리디렉션 처리)
        if (pathname === "/login") {
          return true;
        }

        // 다른 보호된 페이지들은 토큰이 있어야만 접근 허용
        return !!token;
      },
    },
  }
);

// `matcher`는 이 미들웨어가 실행될 경로를 지정합니다.
// 여기에 나열된 경로들은 반드시 로그인이 필요하거나 특별한 처리가 필요합니다.
export const config = {
  matcher: [
    "/book/:isbn/sell", // 중고책 판매글 작성 페이지 (로그인 필요)
    "/login", // 로그인 페이지 (로그인한 사용자 리디렉션 처리)
  ],
};

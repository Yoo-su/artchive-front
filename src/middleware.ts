// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const { pathname } = request.nextUrl;

  console.log("Middleware executed for:", pathname);

  // 인증이 필요한 경로들
  const protectedPaths = [
    "/book/sale/", // /book/sale/[id]
    "/book/", // /book/[isbn]/sell
    "/my-page", // /my-page 하위 모든 경로
  ];

  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some((path) => {
    if (path === "/book/sale/") {
      return pathname.startsWith("/book/sale/");
    }
    if (path === "/book/") {
      // /book/[isbn]/sell 패턴 체크
      const bookSellPattern = /^\/book\/[^\/]+\/sell/;
      return bookSellPattern.test(pathname);
    }
    if (path === "/my-page") {
      return pathname.startsWith("/my-page");
    }
    return false;
  });

  // 보호된 경로인데 토큰이 없으면 로그인 페이지로 리디렉션
  if (isProtectedPath && !token) {
    console.log("Redirecting to login - no token found");
    const loginUrl = new URL("/login", request.url);
    // 로그인 후 원래 페이지로 돌아갈 수 있도록 redirect 파라미터 추가
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 경로에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};

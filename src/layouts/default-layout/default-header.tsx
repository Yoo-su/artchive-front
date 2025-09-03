"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "../common/logo";
import UserPopover from "./user-popover";
import { Button } from "@/shared/components/shadcn/button";
import { Search } from "lucide-react"; // Search 아이콘 임포트

export const DefaultHeader = () => {
  const router = useRouter();

  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between max-w-3xl w-full px-4 py-3 mx-auto">
        {/* 좌측: 로고와 메뉴 */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Logo />
          </Link>
          {/* 향후 다른 메뉴 버튼들이 추가될 네비게이션 영역 */}
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-600 hover:text-gray-900"
              onClick={() => router.push("/book/search")}
              aria-label="도서 검색 페이지로 이동"
            >
              <Search className="w-5 h-5" />
            </Button>
            {/* 여기에 나중에 다른 메뉴 버튼들을 추가할 수 있습니다. */}
          </nav>
        </div>

        {/* 우측: 사용자 정보 */}
        <div className="flex items-center">
          <UserPopover />
        </div>
      </div>
    </header>
  );
};

/* =================================================================
  src/components/layout/UserPopover.tsx
  - 헤더에 들어갈 사용자 아바타 및 Popover 메뉴 컴포넌트입니다.
  - Shadcn/ui 컴포넌트를 사용하여 리팩토링되었습니다.
  =================================================================
*/
"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { useAuthStore } from "@/features/auth/store";
// Shadcn/ui 컴포넌트 임포트
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { Button } from "@/shared/components/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/shadcn/popover";
import { Separator } from "@/shared/components/shadcn/separator";

export default function UserPopover() {
  const { status } = useSession();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/home" });
  };

  if (status === "loading") return null;

  if (!user) {
    return (
      <Link href="/login">
        <Button className="bg-white cursor-pointer hover:bg-white text-gray-600 border-[0.5px] rounded-full border-gray-100 p-2">
          <LogIn />
          로그인
        </Button>
      </Link>
    );
  }

  // 3. 로그인 상태일 때
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative w-10 h-10 transition-transform duration-200 rounded-full hover:scale-105"
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.profileImageUrl || ""} alt={user.nickname} />
            <AvatarFallback>
              {user.nickname.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-0"
        align="end"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user.nickname}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email || "이메일 정보 없음"}
          </p>
        </div>
        <Separator />
        <div className="p-1">
          <Button
            variant="ghost"
            className="justify-start w-full h-auto px-3 py-2"
            asChild
          >
            <Link href="/my-page/posts">판매글목록</Link>
          </Button>
          <Button
            variant="ghost"
            className="justify-start w-full h-auto px-3 py-2"
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

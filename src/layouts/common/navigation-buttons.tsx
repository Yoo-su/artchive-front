"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/shared/components/shadcn/button";
import { Separator } from "@/shared/components/shadcn/separator";

export const NavigationButtons = () => {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const updateNavState = () => {
      // 클라이언트 사이드에서만 history 상태를 확인
      if (typeof window !== "undefined") {
        setCanGoBack(window.history.length > 1);
        // 앞으로가기는 브라우저 보안 정책상 정확한 상태를 알기 어렵습니다.
        // 사용자가 뒤로가기를 했을 때 활성화되는 경험을 위해 우선 true로 둡니다.
        setCanGoForward(true);
      }
    };

    updateNavState();

    const handleRouteChange = () => {
      setTimeout(updateNavState, 100);
    };

    window.addEventListener("popstate", handleRouteChange);

    // next/link 클릭을 감지하기 위한 추가 로직 (선택적)
    // Next.js 13+에서는 router 이벤트를 직접 사용하기 어렵습니다.
    // popstate로 대부분의 브라우저 액션(뒤로/앞으로가기 버튼)을 커버합니다.

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      // ✨ [수정] 위치를 left-6으로 변경하고, 새로운 그라데이션 배경과 그림자 효과 적용
      className="fixed bottom-6 left-6 z-50 flex items-center h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl shadow-purple-500/30 overflow-hidden"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        disabled={!canGoBack}
        className="w-12 h-full text-white rounded-none hover:bg-white/10 disabled:text-white/30 disabled:bg-transparent transition-colors"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Separator orientation="vertical" className="h-6 bg-white/20" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.forward()}
        disabled={!canGoForward}
        className="w-12 h-full text-white rounded-none hover:bg-white/10 disabled:text-white/30 disabled:bg-transparent transition-colors"
        aria-label="앞으로 가기"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </motion.div>
  );
};

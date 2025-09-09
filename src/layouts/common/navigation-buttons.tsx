"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/shared/components/shadcn/button";
import { Separator } from "@/shared/components/shadcn/separator";

export const NavigationButtons = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed bottom-6 left-6 z-50 flex items-center h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl shadow-purple-500/30 overflow-hidden"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
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
        className="w-12 h-full text-white rounded-none hover:bg-white/10 disabled:text-white/30 disabled:bg-transparent transition-colors"
        aria-label="앞으로 가기"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </motion.div>
  );
};

"use client";

import { useMyBookPostsQuery } from "@/features/book/queries";
import { BookPostHistoryList } from "@/features/book/components/book-post-history-list";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { AlertTriangle, BookX } from "lucide-react";

export const BookPostHistoryView = () => {
  const { data: posts, isLoading, isError } = useMyBookPostsQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-full h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-red-500 bg-red-50 p-8 rounded-lg">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="font-semibold">오류 발생</p>
        <p className="text-sm">판매 내역을 불러오는 중 문제가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 py-4">나의 판매 내역</h1>
      <BookPostHistoryList posts={posts || []} />
    </div>
  );
};

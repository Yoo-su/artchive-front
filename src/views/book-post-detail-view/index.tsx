"use client";

import { useBookPostDetailQuery } from "@/features/book/queries";
import { useAuthStore } from "@/features/auth/store";
import { BookPostInfo } from "@/features/book/components/book-post-detail/book-post-info";
import { BookPostActions } from "@/features/book/components/book-post-detail/book-post-actions";

import { AlertTriangle } from "lucide-react";
import { BookPostDetailSkeleton } from "@/features/book/components/book-post-detail/skeleton";

interface BookPostDetailViewProps {
  postId: string;
}
export const BookPostDetailView = ({ postId }: BookPostDetailViewProps) => {
  const { user: currentUser } = useAuthStore();

  const {
    data: post,
    isLoading,
    isError,
  } = useBookPostDetailQuery(postId as string);

  if (isLoading) {
    return <BookPostDetailSkeleton />;
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12" />
        <p className="mt-4 font-semibold">판매글을 불러올 수 없습니다.</p>
        <p className="text-sm text-gray-600">
          존재하지 않거나 삭제된 게시글일 수 있습니다.
        </p>
      </div>
    );
  }

  // 현재 로그인한 유저가 판매자인지 확인
  const isOwner = currentUser?.id === post.user.id;

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <BookPostInfo post={post} />
        <BookPostActions post={post} isOwner={isOwner} />
      </div>
    </div>
  );
};

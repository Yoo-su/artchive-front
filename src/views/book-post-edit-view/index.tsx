"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import { BookPostEditForm } from "@/features/book/components/book-post-edit-form"; // 새로 만들 Form
import { useBookPostDetailQuery } from "@/features/book/queries";

interface BookPostEditViewProps {
  postId: string;
}

export const BookPostEditView = ({ postId }: BookPostEditViewProps) => {
  const { data: post, isLoading, isError } = useBookPostDetailQuery(postId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="py-20 text-center text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12" />
        <p className="mt-4 font-semibold">게시글 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <BookPostEditForm post={post} />
    </div>
  );
};

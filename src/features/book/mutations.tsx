"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createBookPost } from "./apis";
import { CreateBookPostParams } from "./types";

export const useCreateBookPostMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateBookPostParams) => createBookPost(payload),
    onSuccess: (data) => {
      if (data.success) {
        alert("판매글이 성공적으로 등록되었습니다.");
        router.push("/my-page/posts");
      } else {
        throw new Error("게시글 등록에 실패했습니다.");
      }
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      alert(error.message || "오류가 발생했습니다. 다시 시도해주세요.");
    },
  });
};

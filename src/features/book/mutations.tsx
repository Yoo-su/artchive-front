"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// uploadImages Server Action을 직접 임포트합니다.
import { uploadImages } from "./actions/upload-action";
import { createBookPost } from "./apis";
import { CreateBookPostParams, UsedBookPost } from "./types";

interface CreatePostVariables {
  formData: FormData;
  payload: Omit<CreateBookPostParams, "imageUrls">;
}
export const useCreateBookPostMutation = () => {
  const router = useRouter();

  return useMutation<UsedBookPost, Error, CreatePostVariables>({
    // ⭐️ mutationFn 내에서 이미지 업로드와 판매글 생성을 순차적으로 처리
    mutationFn: async ({ formData, payload }) => {
      // 1. 이미지 업로드
      const uploadResult = await uploadImages(formData);
      if (!uploadResult.success || !uploadResult.blobs) {
        throw new Error(uploadResult.error || "이미지 업로드에 실패했습니다.");
      }
      const imageUrls = uploadResult.blobs.map((blob) => blob.url);

      // 2. 업로드된 이미지 URL을 포함하여 판매글 생성 API 호출
      const finalPayload = { ...payload, imageUrls };
      const postResult = await createBookPost(finalPayload);

      if (!postResult.success) {
        throw new Error("게시글 등록에 실패했습니다.");
      }
      return postResult.data;
    },
    onSuccess: () => {
      alert("판매글이 성공적으로 등록되었습니다.");
      router.push("/my-page/posts");
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      alert(error.message || "오류가 발생했습니다. 다시 시도해주세요.");
    },
  });
};

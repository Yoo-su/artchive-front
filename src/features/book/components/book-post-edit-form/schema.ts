import { z } from "zod";

import { sellFormSchema } from "../book-sell-form/schema";

// 기존 sellFormSchema를 상속받아 수정 전용 스키마를 만듭니다.
export const editFormSchema = sellFormSchema.extend({
  // images 필드를 optional로 변경합니다.
  // 이렇게 하면, 사용자가 새 이미지를 추가하지 않아도 Zod 유효성 검사를 통과합니다.
  images: z
    .custom<FileList>()
    .refine(
      (files) => files.length <= 5,
      "새로 추가하는 이미지는 최대 5개까지 등록할 수 있습니다."
    )
    .optional(), // 이 필드는 필수가 아님
});

// 수정 폼에서 사용할 타입
export type EditFormValues = z.infer<typeof editFormSchema>;

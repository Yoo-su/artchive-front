import { z } from "zod";

export const sellFormSchema = z.object({
  title: z
    .string()
    .min(5, "제목은 5자 이상 입력해주세요.")
    .max(50, "제목은 50자를 초과할 수 없습니다."),
  price: z
    .string()
    .min(1, "가격을 입력해주세요.")
    .refine((val) => /^\d+$/.test(val), "숫자만 입력 가능합니다.")
    .refine((val) => parseInt(val) > 0, "가격은 0보다 커야 합니다."),
  city: z.string().min(1, "시/도를 선택해주세요."),
  district: z.string().min(1, "시/군/구를 선택해주세요."),
  content: z
    .string()
    .min(10, "상세 내용은 10자 이상 입력해주세요.")
    .max(1000, "상세 내용은 1,000자를 초과할 수 없습니다."),
  images: z
    .custom<FileList>()
    .refine(
      (files) => files && files.length > 0,
      "이미지를 1개 이상 등록해주세요."
    )
    .refine(
      (files) => files && files.length <= 5,
      "이미지는 최대 5개까지 등록할 수 있습니다."
    ),
});

export type SellFormValues = z.infer<typeof sellFormSchema>;

import { Badge } from "@/shared/components/shadcn/badge";
import { PostStatus } from "../../types";
import { cn } from "@/shared/utils/cn";

// 상태에 따른 배지 스타일과 텍스트를 정의하는 맵
const STATUS_INFO: {
  [key in PostStatus]: { text: string; className: string };
} = {
  FOR_SALE: {
    text: "판매중",
    className: "bg-emerald-500 hover:bg-emerald-600",
  },
  RESERVED: {
    text: "예약중",
    className: "bg-amber-500 hover:bg-amber-600",
  },
  SOLD: {
    text: "판매완료",
    className: "bg-gray-400 hover:bg-gray-500",
  },
};

/**
 * 중고책 판매글의 상태를 표시하는 공용 배지 컴포넌트입니다.
 */
interface PostStatusBadgeProps {
  status: PostStatus;
  className?: string; // 추가적인 Tailwind 클래스를 받을 수 있습니다.
}
export const PostStatusBadge = ({
  status,
  className,
}: PostStatusBadgeProps) => {
  const statusInfo = STATUS_INFO[status] || STATUS_INFO.SOLD;

  return (
    // ✨ [수정됨] cn 함수를 사용하여 기본 클래스와 추가 클래스를 병합합니다.
    <Badge variant="default" className={cn(statusInfo.className, className)}>
      {statusInfo.text}
    </Badge>
  );
};

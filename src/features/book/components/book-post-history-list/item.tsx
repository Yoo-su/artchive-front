"use client";

import { Edit, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/shared/components/shadcn/button";
import { Card, CardContent } from "@/shared/components/shadcn/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";

import { useUpdateBookPostStatusMutation } from "../../queries";
import { PostStatus, UsedBookPost } from "../../types";
import { PostStatusBadge } from "../common/post-status-badge";

// 상태 한글 변환
const statusToKorean: { [key in PostStatus]: string } = {
  FOR_SALE: "판매중",
  RESERVED: "예약중",
  SOLD: "판매완료",
};

interface BookPostHistoryItemProps {
  post: UsedBookPost;
}
export const BookPostHistoryItem = ({ post }: BookPostHistoryItemProps) => {
  const { mutate: updateStatus } = useUpdateBookPostStatusMutation();

  const handleStatusChange = (newStatus: PostStatus) => {
    // DropdownMenu 내부의 Select 클릭 시 링크 이동을 막기 위함
    event?.stopPropagation();
    updateStatus({ postId: post.id, status: newStatus });
  };

  const handleDropdownClick = (event: React.MouseEvent) => {
    // DropdownMenu를 열 때 카드 전체의 onClick 이벤트가 실행되는 것을 방지
    event.stopPropagation();
  };

  return (
    // Link 컴포넌트로 전체 카드를 감싸서 클릭 가능 영역으로 만듭니다.
    <Link href={`/used-book/${post.id}`} passHref>
      <Card className="transition-shadow duration-300 hover:shadow-md cursor-pointer">
        <CardContent className="flex items-center p-4 gap-4">
          <div className="relative w-20 h-28 flex-shrink-0">
            <Image
              src={post.book.image ?? "/placeholder.jpg"}
              alt={post.book.title}
              fill
              sizes="80px"
              className="rounded-md object-cover"
            />
          </div>
          <div className="flex-grow min-w-0">
            {" "}
            {/* ✨ [수정됨] 자식 요소의 너비 계산 기준점 */}
            <div className="flex items-start justify-between gap-2">
              {/* ✨ [수정됨] 제목과 정보가 포함된 영역이 유연하게 늘어나도록 설정 */}
              <div className="flex-grow w-0">
                <PostStatusBadge status={post.status} />
                <h3 className="font-semibold text-lg mt-1 truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {post.book.title}
                </p>
              </div>
              {/* ✨ [수정됨] 더보기 메뉴가 밀려나지 않도록 고정 */}
              <div className="flex-shrink-0" onClick={handleDropdownClick}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>수정</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="font-bold text-gray-800">
                {post.price.toLocaleString()}원
              </p>
              <div onClick={handleDropdownClick}>
                <Select value={post.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="상태 변경" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PostStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusToKorean[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

import { Edit, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";

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
    updateStatus({ postId: post.id, status: newStatus });
  };

  return (
    <Card onClick={() => (location.href = `/book/post/${post.id}`)}>
      <CardContent className="flex items-center p-4 gap-4">
        <Image
          src={post.book.image ?? "/placeholder.jpg"}
          alt={post.book.title}
          width={80}
          height={112}
          className="rounded-md object-cover flex-shrink-0"
        />
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <div>
              <PostStatusBadge status={post.status} />
              <h3 className="font-semibold text-lg mt-1 truncate">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500">{post.book.title}</p>
            </div>
            <div className="flex-shrink-0">
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
      </CardContent>
    </Card>
  );
};

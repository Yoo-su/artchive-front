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

import {
  useDeleteBookPostMutation,
  useUpdateBookPostStatusMutation,
} from "../../mutations";
import { PostStatus, UsedBookPost } from "../../types";
import { PostStatusBadge } from "../common/post-status-badge";

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
  const { mutate: deletePost, isPending: isDeleting } =
    useDeleteBookPostMutation();

  const handleStatusChange = (newStatus: PostStatus) => {
    updateStatus({ postId: post.id, status: newStatus });
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (
      window.confirm(
        "정말로 이 판매글을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다."
      )
    ) {
      deletePost({ postId: post.id, imageUrls: post.imageUrls });
    }
  };

  const handleDropdownClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <Link href={`/book/post/${post.id}`} passHref>
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
            <div className="flex items-start justify-between gap-2">
              <div className="flex-grow w-0">
                <PostStatusBadge status={post.status} />
                <h3 className="font-semibold text-lg mt-1 truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {post.book.title}
                </p>
              </div>
              <div onClick={handleDropdownClick}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/my-page/posts/${post.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>수정</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{isDeleting ? "삭제 중..." : "삭제"}</span>
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

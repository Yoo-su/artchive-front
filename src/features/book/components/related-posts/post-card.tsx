import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { Card, CardContent } from "@/shared/components/shadcn/card";
import { formatPostDate } from "@/shared/utils/date";

import { UsedBookPost } from "../../types";
import { PostStatusBadge } from "../common/post-status-badge";

interface PostCardProps {
  post: UsedBookPost;
}
export const PostCard = ({ post }: PostCardProps) => {
  // ✨ 수정된 날짜가 있으면 updatedAt, 없으면 createdAt 사용
  const displayDate =
    post.updatedAt > post.createdAt ? post.updatedAt : post.createdAt;

  return (
    <Link href={`/book/post/${post.id}`} passHref>
      <Card className="group h-full w-full overflow-hidden duration-300">
        <CardContent className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.imageUrls[0] || "/placeholder.jpg"}
              alt={post.title}
              fill
              sizes="250px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/250x192/e2e8f0/64748b?text=Image";
              }}
            />
            <PostStatusBadge
              status={post.status}
              className="absolute right-2 top-2"
            />
          </div>
          <div className="p-4">
            <h3 className="truncate font-semibold text-gray-800">
              {post.title}
            </h3>
            <p className="mt-2 text-xl font-bold text-violet-600">
              {post.price.toLocaleString()}원
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{formatPostDate(displayDate)}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t pt-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.user.profileImageUrl || ""} />
                <AvatarFallback>
                  {post.user.nickname.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">
                {post.user.nickname}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

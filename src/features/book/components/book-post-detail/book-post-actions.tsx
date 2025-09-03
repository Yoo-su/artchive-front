"use client";

import { Edit, MessageCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { Button } from "@/shared/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/card";
import { Separator } from "@/shared/components/shadcn/separator";

import { UsedBookPost } from "../../types";
import { PostStatusBadge } from "../common/post-status-badge";

interface BookPostActionsProps {
  post: UsedBookPost;
  isOwner: boolean;
}

export const BookPostActions = ({ post, isOwner }: BookPostActionsProps) => {
  const discountRate =
    Number(post.book.discount) > 0
      ? Math.round(
          ((Number(post.book.discount) - post.price) /
            Number(post.book.discount)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Post Main Info */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PostStatusBadge status={post.status} />
          <span className="text-sm text-gray-500">
            {post.city} {post.district}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {post.title}
        </h1>
        <p className="mt-4 text-2xl font-bold text-violet-600">
          {post.price.toLocaleString()}원
          {discountRate > 0 && (
            <span className="ml-3 text-lg font-medium text-gray-400 line-through">
              {post.book.discount.toLocaleString()}원
            </span>
          )}
        </p>
      </div>

      <Separator />

      {/* Seller Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={post.user.profileImageUrl || undefined}
              alt={post.user.nickname}
            />
            <AvatarFallback>{post.user.nickname.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-800">{post.user.nickname}</p>
            <p className="text-sm text-gray-500">판매자</p>
          </div>
        </div>
        {isOwner ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>
        ) : (
          <Button size="lg" className="w-full md:w-auto">
            <MessageCircle className="w-5 h-5 mr-2" />
            판매자와 채팅하기
          </Button>
        )}
      </div>

      <Separator />

      {/* Post Content */}
      <div className="prose max-w-none text-gray-700">
        <p>{post.content}</p>
      </div>

      {/* Book Info Card */}
      <Link href={`/book/${post.book.isbn}/detail`}>
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">도서 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-20 h-[120px] flex-shrink-0">
                <Image
                  src={post.book.image}
                  alt={post.book.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-gray-800">{post.book.title}</p>
                <p className="text-gray-600">저자: {post.book.author}</p>
                <p className="text-gray-600">출판사: {post.book.publisher}</p>
                <p className="text-gray-500 pt-1 line-clamp-2">
                  {post.book.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

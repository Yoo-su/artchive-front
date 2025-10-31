// src/features/book/components/book-sale-detail/book-sale-actions.tsx
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Clock, Edit, Loader2, MessageCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { findOrCreateRoom } from "@/features/chat/apis";
import { useChatStore } from "@/features/chat/stores/use-chat-store";
import { ChatRoom } from "@/features/chat/types";
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
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { formatPostDate } from "@/shared/utils/date";

import { useDeleteBookSaleMutation } from "../../mutations";
import { UsedBookSale } from "../../types";
import { SaleStatusBadge } from "../common/sale-status-badge";

interface BookSaleActionsProps {
  sale: UsedBookSale;
  isOwner: boolean;
}

export const BookSaleActions = ({ sale, isOwner }: BookSaleActionsProps) => {
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { openChatRoom, subscribeToRoom } = useChatStore();
  const queryClient = useQueryClient();
  const { mutate: deleteSale, isPending: isDeleting } =
    useDeleteBookSaleMutation();

  const displayDate =
    sale.updatedAt > sale.createdAt ? sale.updatedAt : sale.createdAt;
  const dateLabel = sale.updatedAt > sale.createdAt ? "수정" : "작성";

  const discountRate =
    Number(sale.book.discount) > 0
      ? Math.round(
          ((Number(sale.book.discount) - sale.price) /
            Number(sale.book.discount)) *
            100
        )
      : 0;

  const handleDelete = () => {
    if (
      window.confirm(
        "정말로 이 판매글을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다."
      )
    ) {
      deleteSale({ saleId: sale.id, imageUrls: sale.imageUrls });
    }
  };

  const handleStartChat = async () => {
    setIsCreatingChat(true);
    try {
      const newRoom = await findOrCreateRoom(sale.id);

      // 새 채팅방을 구독합니다.
      subscribeToRoom(newRoom.id);

      // 채팅방 목록 쿼리 데이터를 업데이트하여 새 채팅방을 추가합니다.
      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldRooms) => {
          if (!oldRooms) return [newRoom];
          // 이미 존재하는 방인지 확인합니다.
          const isExisting = oldRooms.some((room) => room.id === newRoom.id);
          if (isExisting) {
            // 기존 방이 있다면, 활성 상태로 만들고 목록의 맨 위로 올립니다.
            return oldRooms
              .map((room) => (room.id === newRoom.id ? newRoom : room))
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
          }
          // 새 방이라면 목록의 맨 앞에 추가합니다.
          return [newRoom, ...oldRooms];
        }
      );

      // 채팅방을 엽니다.
      openChatRoom(newRoom.id, queryClient);
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("채팅방을 여는 데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-2 text-sm text-gray-500">
          <SaleStatusBadge status={sale.status} />
          <span>
            {sale.city} {sale.district}
          </span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {dateLabel} {formatPostDate(displayDate)}
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {sale.title}
        </h1>
        <p className="mt-4 text-2xl font-bold text-violet-600">
          {sale.price.toLocaleString()}원
          {discountRate > 0 && (
            <span className="ml-3 text-lg font-medium text-gray-400 line-through">
              {Number(sale.book.discount).toLocaleString()}원
            </span>
          )}
        </p>
      </div>

      <Separator />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={sale.user.profileImageUrl || undefined}
              alt={sale.user.nickname}
            />
            <AvatarFallback>{sale.user.nickname.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-800">{sale.user.nickname}</p>
            <p className="text-sm text-gray-500">판매자</p>
          </div>
        </div>
        {isOwner ? (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/my-page/sales/${sale.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                수정
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleStartChat}
            disabled={isCreatingChat}
          >
            {isCreatingChat ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="w-5 h-5 mr-2" />
            )}
            {isCreatingChat ? "채팅방 여는 중..." : "판매자와 채팅하기"}
          </Button>
        )}
      </div>

      <Separator />

      <div className="prose max-w-none text-gray-700">
        <p>{sale.content}</p>
      </div>

      <Link href={`/book/${sale.book.isbn}/detail`}>
        <Card className="transition-shadow bg-gray-50 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">도서 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-20 h-[120px] flex-shrink-0">
                <Image
                  src={sale.book.image}
                  alt={sale.book.title}
                  fill
                  sizes="80px"
                  className="object-cover rounded-md"
                />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-gray-800">{sale.book.title}</p>
                <p className="text-gray-600">저자: {sale.book.author}</p>
                <p className="text-gray-600">출판사: {sale.book.publisher}</p>
                <p className="text-gray-500 pt-1 line-clamp-2">
                  {sale.book.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useState } from "react";

import { useGetUser } from "@/features/auth/queries";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { markMessagesAsRead } from "../apis";
import { useChatStore } from "../stores/use-chat-store";
import { ChatRoom } from "../types";

const formatLastMessageTime = (date: string) => {
  const messageDate = new Date(date);
  if (isToday(messageDate)) return format(messageDate, "p", { locale: ko });
  if (isYesterday(messageDate)) return "어제";
  return format(messageDate, "MMM d일", { locale: ko });
};

export const ChatItem = ({ room }: { room: ChatRoom }) => {
  const { openChatRoom } = useChatStore();
  const { data: currentUser } = useGetUser();
  const queryClient = useQueryClient();
  const [isOpening, setIsOpening] = useState(false);

  const opponent = room.participants.find(
    (p) => p.user.id !== currentUser?.id
  )?.user;

  const handleOpenRoom = async () => {
    if (isOpening) return;
    setIsOpening(true);
    try {
      if ((room.unreadCount ?? 0) > 0) {
        await markMessagesAsRead(room.id);
        queryClient.setQueryData<ChatRoom[]>(
          QUERY_KEYS.chatKeys.rooms.queryKey,
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((r) =>
              r.id === room.id ? { ...r, unreadCount: 0 } : r
            );
          }
        );
      }
      openChatRoom(room.id, queryClient);
    } catch (error) {
      console.error("Failed to open chat room:", error);
      openChatRoom(room.id, queryClient);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div
      className="flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-gray-50"
      onClick={handleOpenRoom}
    >
      <Avatar className="h-14 w-14">
        <AvatarImage src={opponent?.profileImageUrl || ""} />
        <AvatarFallback>{opponent?.nickname.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate text-gray-800">
            {opponent?.nickname}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
            판매도서
          </span>
          <p className="text-sm text-gray-700 truncate font-semibold">
            {room.usedBookSale.book.title}
          </p>
        </div>
        <div className="flex justify-between items-start mt-1.5">
          <div className="flex items-center justify-between text-sm text-gray-500 w-10/12">
            <div className="flex items-center gap-1.5 truncate">
              <MessageSquareText className="h-4 w-4 flex-shrink-0" />
              <p className="truncate">
                {room.lastMessage?.content || "아직 메시지가 없습니다."}
              </p>
            </div>
            {room.lastMessage && (
              <p className="text-xs text-gray-400 flex-shrink-0">
                {formatLastMessageTime(room.lastMessage.createdAt)}
              </p>
            )}
          </div>
          {(room.unreadCount ?? 0) > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white flex-shrink-0"
            >
              {room.unreadCount}
            </motion.div>
          )}
        </div>
      </div>
      <Avatar className="h-14 w-14 rounded-md flex-shrink-0">
        <AvatarImage
          src={room.usedBookSale.book.image}
          alt={room.usedBookSale.book.title}
          className="object-cover rounded-md"
        />
        <AvatarFallback className="rounded-md">Book</AvatarFallback>
      </Avatar>
    </div>
  );
};

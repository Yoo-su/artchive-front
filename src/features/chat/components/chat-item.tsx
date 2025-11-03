"use client";

import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";

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
  const { data: session } = useSession();
  const currentUser = session?.user;
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
          {room.lastMessage && (
            <p className="text-xs text-gray-400 flex-shrink-0">
              {formatLastMessageTime(room.lastMessage.createdAt)}
            </p>
          )}
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-500 truncate w-10/12">
            {room.lastMessage?.content || "아직 메시지가 없습니다."}
          </p>
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
    </div>
  );
};

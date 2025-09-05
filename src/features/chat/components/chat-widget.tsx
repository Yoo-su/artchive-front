"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../stores/use-chat-store";
import { Card } from "@/shared/components/shadcn/card";
import { ChatList } from "./chat-list";
import { ChatRoom } from "./chat-room";

import { useMyChatRoomsQuery, useInfiniteChatMessagesQuery } from "../queries";
import { useChatSocket } from "../hooks/use-chat-socket";
import { useMemo } from "react";

export const ChatWidget = () => {
  const { isChatOpen, activeChatRoomId } = useChatStore();
  const { data: rooms, isLoading: isRoomsLoading } = useMyChatRoomsQuery();
  const {
    data: messagesData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading: isMessagesLoading,
  } = useInfiniteChatMessagesQuery(activeChatRoomId!);

  const { sendMessage } = useChatSocket(activeChatRoomId);

  const activeChatRoom = rooms?.find((room) => room.id === activeChatRoomId);

  const roomMessages = useMemo(() => {
    if (!messagesData) return [];
    // 1. flatMap으로 모든 페이지의 메시지를 하나의 배열로 만듭니다.
    // 2. sort로 시간순(오래된 메시지 -> 최신 메시지)으로 정렬합니다.
    return messagesData.pages
      .flatMap((page) => page.messages)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [messagesData]);

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-24 right-6 z-[999] h-[70vh] w-[90vw] max-w-sm"
        >
          <Card className="h-full w-full flex flex-col shadow-2xl overflow-hidden">
            {activeChatRoomId ? (
              <ChatRoom
                room={activeChatRoom}
                messages={roomMessages}
                isLoading={isMessagesLoading}
                sendMessage={sendMessage}
                fetchPreviousPage={fetchPreviousPage}
                hasPreviousPage={hasPreviousPage}
                isFetchingPreviousPage={isFetchingPreviousPage}
              />
            ) : (
              <ChatList rooms={rooms || []} isLoading={isRoomsLoading} />
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

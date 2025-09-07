"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

import { Card } from "@/shared/components/shadcn/card";

import { useInfiniteChatMessagesQuery, useMyChatRoomsQuery } from "../queries";
import { useChatStore } from "../stores/use-chat-store";
import { ChatList } from "./chat-list";
import { ChatRoom } from "./chat-room";

export const ChatWidget = () => {
  // `sendMessage`는 스토어에서 가져오도록 수정
  const { isChatOpen, activeChatRoomId, sendMessage } = useChatStore();
  const { data: rooms, isLoading: isRoomsLoading } = useMyChatRoomsQuery();
  const {
    data: messagesData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading: isMessagesLoading,
  } = useInfiniteChatMessagesQuery(activeChatRoomId!);

  // useChatSocket hook은 이제 사용하지 않습니다.

  const activeChatRoom = rooms?.find((room) => room.id === activeChatRoomId);

  const roomMessages = useMemo(() => {
    if (!messagesData) return [];
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
                sendMessage={sendMessage} // 스토어의 sendMessage 전달
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

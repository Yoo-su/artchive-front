"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

import { Card } from "@/shared/components/shadcn/card";

import { useInfiniteChatMessagesQuery, useMyChatRoomsQuery } from "../queries";
import { useChatStore } from "../stores/use-chat-store";
import { ChatList } from "./chat-list";
import { ChatRoom } from "./chat-room";

export const ChatWidget = () => {
  const {
    isChatOpen,
    activeChatRoomId,
    sendMessage,
    typingUsers,
    emitStartTyping,
    emitStopTyping,
  } = useChatStore();

  const { data: rooms, isLoading: isRoomsLoading } = useMyChatRoomsQuery();
  const {
    data: messagesData,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading: isMessagesLoading,
  } = useInfiniteChatMessagesQuery(activeChatRoomId!);

  const activeChatRoom = rooms?.find((room) => room.id === activeChatRoomId);

  const typingNickname = activeChatRoomId ? typingUsers[activeChatRoomId] : "";

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
                sendMessage={sendMessage}
                fetchPreviousPage={fetchPreviousPage}
                hasPreviousPage={hasPreviousPage}
                isFetchingPreviousPage={isFetchingPreviousPage}
                typingNickname={typingNickname}
                emitStartTyping={emitStartTyping}
                emitStopTyping={emitStopTyping}
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

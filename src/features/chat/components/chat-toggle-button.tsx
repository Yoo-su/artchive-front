"use client";

import { useMemo } from "react";
import { useChatStore } from "../stores/use-chat-store";
import { useMyChatRoomsQuery } from "../queries";
import { Button } from "@/shared/components/shadcn/button";
import { MessagesSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ChatToggleButton = () => {
  const { toggleChat, isChatOpen } = useChatStore();
  const { data: rooms } = useMyChatRoomsQuery();

  const totalUnreadCount = useMemo(() => {
    if (!rooms) return 0;
    return rooms.reduce((acc, room) => acc + (room.unreadCount || 0), 0);
  }, [rooms]);

  return (
    <div className="fixed bottom-6 right-6 z-[1000]">
      <AnimatePresence>
        {totalUnreadCount > 0 && !isChatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg"
          >
            {totalUnreadCount}
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-violet-600 text-white shadow-2xl transition-transform duration-300 hover:scale-110 hover:bg-violet-700"
        onClick={toggleChat}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={isChatOpen ? "x" : "chat"}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            {isChatOpen ? <X size={28} /> : <MessagesSquare size={28} />}
          </motion.div>
        </AnimatePresence>
      </Button>
    </div>
  );
};

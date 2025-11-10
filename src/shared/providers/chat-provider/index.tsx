"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store";
import { ChatToggleButton } from "@/features/chat/components/chat-toggle-button";
import { ChatWidget } from "@/features/chat/components/chat-widget";
import { useChatStore } from "@/features/chat/stores/use-chat-store";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { connect, disconnect, socket } = useChatStore();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      connect(queryClient);
    }

    return () => {
      if (socket) disconnect();
    };
  }, [user, connect, disconnect, queryClient]);

  return (
    <>
      {children}
      {user && (
        <>
          <ChatToggleButton />
          <ChatWidget />
        </>
      )}
    </>
  );
};

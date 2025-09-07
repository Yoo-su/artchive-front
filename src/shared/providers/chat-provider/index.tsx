"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store";
import { ChatToggleButton } from "@/features/chat/components/chat-toggle-button";
import { ChatWidget } from "@/features/chat/components/chat-widget";
import { useChatStore } from "@/features/chat/stores/use-chat-store";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuthStore();
  const { connect, disconnect, socket } = useChatStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // accessToken이 있고, 소켓이 연결되지 않았을 때 연결
    if (accessToken && !socket) {
      connect(queryClient);
    }

    // accessToken이 없거나 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (!accessToken) {
        disconnect();
      }
    };
  }, [accessToken, connect, disconnect, socket, queryClient]);

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

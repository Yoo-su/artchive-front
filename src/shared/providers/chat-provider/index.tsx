"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { ChatToggleButton } from "@/features/chat/components/chat-toggle-button";
import { ChatWidget } from "@/features/chat/components/chat-widget";
import { useChatStore } from "@/features/chat/stores/use-chat-store";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const { connect, disconnect, socket } = useChatStore();
  const queryClient = useQueryClient();

  const user = session?.user;
  const accessToken = session?.accessToken;

  useEffect(() => {
    if (accessToken && !socket) {
      connect(queryClient);
    }

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

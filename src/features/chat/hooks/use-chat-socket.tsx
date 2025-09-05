import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ChatMessage, ChatRoom, GetChatMessagesResponse } from "../types";

type InfiniteMessagesData = {
  pages: GetChatMessagesResponse[];
  pageParams: (number | undefined)[];
};

export const useChatSocket = (roomId: number | null) => {
  const { accessToken, user: currentUser } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken || !roomId) {
      socketRef.current?.disconnect();
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transportOptions: {
        polling: {
          extraHeaders: { Authorization: `Bearer ${accessToken}` },
        },
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("joinRoom", roomId));

    socket.on("newMessage", (newMessage: ChatMessage) => {
      // 1. 메시지 목록 캐시 업데이트
      queryClient.setQueryData<InfiniteMessagesData>(
        QUERY_KEYS.chatKeys.messages(roomId).queryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          const latestPage = newPages[0];
          newPages[0] = {
            ...latestPage,
            messages: [newMessage, ...latestPage.messages],
          };
          return { ...oldData, pages: newPages };
        }
      );

      // 2. 채팅방 목록 캐시 업데이트 (안읽은 개수, 마지막 메시지)
      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldRooms) => {
          if (!oldRooms) return [];
          return oldRooms
            .map((room) => {
              if (room.id === roomId) {
                const isMyMessage = newMessage.sender.id === currentUser?.id;
                return {
                  ...room,
                  lastMessage: newMessage,
                  unreadCount: isMyMessage
                    ? room.unreadCount
                    : (room.unreadCount || 0) + 1,
                };
              }
              return room;
            })
            .sort((a, b) => {
              // 마지막 메시지 기준으로 다시 정렬
              if (!a.lastMessage) return 1;
              if (!b.lastMessage) return -1;
              return (
                new Date(b.lastMessage.createdAt).getTime() -
                new Date(a.lastMessage.createdAt).getTime()
              );
            });
        }
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, accessToken, queryClient, currentUser?.id]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit("sendMessage", { roomId, content });
  };

  return { sendMessage };
};

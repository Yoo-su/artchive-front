import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { useAuthStore } from "@/features/auth/store";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { ChatMessage, ChatRoom, GetChatMessagesResponse } from "../types";

type InfiniteMessagesData = {
  pages: GetChatMessagesResponse[];
  pageParams: (number | undefined)[];
};

interface ChatState {
  socket: Socket | null;
  isChatOpen: boolean;
  activeChatRoomId: number | null;

  connect: (queryClient: QueryClient) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;

  toggleChat: () => void;
  openChatRoom: (roomId: number) => void;
  closeChatRoom: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  isChatOpen: false,
  activeChatRoomId: null,

  // 1. 소켓 연결 및 이벤트 리스너 설정
  connect: (queryClient) => {
    const { accessToken, user: currentUser } = useAuthStore.getState();

    if (!accessToken || get().socket) {
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transportOptions: {
        polling: {
          extraHeaders: { Authorization: `Bearer ${accessToken}` },
        },
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    // ⭐️ 핵심: 'newMessage' 이벤트 핸들러 중앙화
    newSocket.on("newMessage", (newMessage: ChatMessage) => {
      const roomId = newMessage.chatRoom.id;

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
                // 현재 채팅방을 보고 있지 않을 때만 unreadCount 증가
                const isViewingChat =
                  get().isChatOpen && get().activeChatRoomId === roomId;
                return {
                  ...room,
                  lastMessage: newMessage,
                  unreadCount:
                    isMyMessage || isViewingChat
                      ? room.unreadCount
                      : (room.unreadCount || 0) + 1,
                };
              }
              return room;
            })
            .sort((a, b) => {
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

    set({ socket: newSocket });
  },

  // 2. 소켓 연결 해제
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },

  // 3. 메시지 전송
  sendMessage: (content) => {
    const { socket, activeChatRoomId } = get();
    if (socket && activeChatRoomId) {
      socket.emit("sendMessage", { roomId: activeChatRoomId, content });
    }
  },

  // --- 기존 UI 상태 관리 액션 ---
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  openChatRoom: (roomId) => {
    get().socket?.emit("joinRoom", roomId); // 방에 입장
    set({ activeChatRoomId: roomId, isChatOpen: true });
  },
  closeChatRoom: () => {
    get().socket?.emit("leaveRoom", get().activeChatRoomId); // 방에서 퇴장
    set({ activeChatRoomId: null });
  },
}));

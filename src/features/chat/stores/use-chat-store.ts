import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { useAuthStore } from "@/features/auth/store";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getMyChatRooms } from "../apis";
import { ChatMessage, ChatRoom, GetChatMessagesResponse } from "../types";

type InfiniteMessagesData = {
  pages: GetChatMessagesResponse[];
  pageParams: (number | undefined)[];
};

interface ChatState {
  socket: Socket | null;
  isChatOpen: boolean;
  activeChatRoomId: number | null;
  typingUsers: { [roomId: number]: string };

  connect: (queryClient: QueryClient) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  emitStartTyping: () => void;
  emitStopTyping: () => void;

  toggleChat: () => void;
  openChatRoom: (roomId: number, queryClient: QueryClient) => void;
  closeChatRoom: () => void;
  markRoomAsRead: (roomId: number, queryClient: QueryClient) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  isChatOpen: false,
  activeChatRoomId: null,
  typingUsers: {},

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

    newSocket.on("connect", async () => {
      console.log("Socket connected:", newSocket.id);
      try {
        const rooms = await getMyChatRooms();
        const roomIds = rooms.map((room) => room.id);
        newSocket.emit("subscribeToAllRooms", roomIds);
        console.log("✅ Subscribed to all rooms:", roomIds);
      } catch (error) {
        console.error("Failed to subscribe to rooms:", error);
      }
    });

    newSocket.on("newMessage", (newMessage: ChatMessage) => {
      const roomId = newMessage.chatRoom.id;
      const { isChatOpen, activeChatRoomId } = get();

      queryClient.setQueryData<InfiniteMessagesData>(
        QUERY_KEYS.chatKeys.messages(roomId).queryKey,
        (oldData) => {
          if (!oldData) {
            return {
              pages: [{ messages: [newMessage], hasNextPage: true }],
              pageParams: [1],
            };
          }
          const newPages = [...oldData.pages];
          const latestPage = newPages[0] || {
            messages: [],
            hasNextPage: false,
          };
          newPages[0] = {
            ...latestPage,
            messages: [newMessage, ...latestPage.messages],
          };
          return { ...oldData, pages: newPages };
        }
      );

      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldRooms) => {
          if (!oldRooms) return [];
          return oldRooms
            .map((room) => {
              if (room.id === roomId) {
                const isMyMessage = newMessage.sender.id === currentUser?.id;
                const isViewingChat = isChatOpen && activeChatRoomId === roomId;
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

    newSocket.on("typing", ({ nickname, isTyping }) => {
      const { activeChatRoomId } = get();
      if (activeChatRoomId) {
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [activeChatRoomId]: isTyping ? nickname : "",
          },
        }));
      }
    });

    set({ socket: newSocket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },

  sendMessage: (content) => {
    const { socket, activeChatRoomId } = get();
    if (!socket || !activeChatRoomId || !content.trim()) return;

    socket.emit(
      "sendMessage",
      { roomId: activeChatRoomId, content },
      (response: { status: string; error?: string; message?: ChatMessage }) => {
        if (response.status === "ok") {
          // console.log("Message sent successfully:", response.message);
        } else {
          console.error("Message failed to send:", response.error);
          alert(`메시지 전송에 실패했습니다: ${response.error}`);
        }
      }
    );
  },

  emitStartTyping: () => {
    const { socket, activeChatRoomId } = get();
    if (socket && activeChatRoomId) {
      socket.emit("startTyping", { roomId: activeChatRoomId });
    }
  },

  emitStopTyping: () => {
    const { socket, activeChatRoomId } = get();
    if (socket && activeChatRoomId) {
      socket.emit("stopTyping", { roomId: activeChatRoomId });
    }
  },

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  openChatRoom: (roomId, queryClient) => {
    get().markRoomAsRead(roomId, queryClient);
    set({ activeChatRoomId: roomId, isChatOpen: true });
  },

  closeChatRoom: () => {
    set({ activeChatRoomId: null });
  },

  markRoomAsRead: (roomId, queryClient) => {
    queryClient.setQueryData<ChatRoom[]>(
      QUERY_KEYS.chatKeys.rooms.queryKey,
      (oldRooms) => {
        if (!oldRooms) return [];
        return oldRooms.map((room) =>
          room.id === roomId ? { ...room, unreadCount: 0 } : room
        );
      }
    );
  },
}));

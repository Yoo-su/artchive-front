import { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { create } from "zustand";

import { useAuthStore } from "@/features/auth/store";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getMyChatRooms, leaveChatRoom } from "../apis";
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
  isRoomInactive: { [roomId: number]: boolean };

  connect: (queryClient: QueryClient) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  emitStartTyping: () => void;
  emitStopTyping: () => void;
  leaveRoom: (queryClient: QueryClient) => void;
  subscribeToRoom: (roomId: number) => void;

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
  isRoomInactive: {},

  connect: (queryClient) => {
    const { accessToken, user: currentUser } = useAuthStore.getState();
    if (!accessToken || get().socket) return;

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
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          newPages[0] = {
            ...newPages[0],
            messages: [newMessage, ...newPages[0].messages],
          };
          return { ...oldData, pages: newPages };
        },
      );

      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldRooms) => {
          if (!oldRooms) return [];
          return oldRooms
            .map((room) =>
              room.id === roomId
                ? {
                    ...room,
                    lastMessage: newMessage,
                    unreadCount:
                      newMessage.sender?.id === currentUser?.id ||
                      (isChatOpen && activeChatRoomId === roomId)
                        ? room.unreadCount
                        : (room.unreadCount || 0) + 1,
                  }
                : room,
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessage?.createdAt ?? 0).getTime() -
                new Date(a.lastMessage?.createdAt ?? 0).getTime(),
            );
        },
      );
    });

    newSocket.on(
      "userLeft",
      ({ roomId, message }: { roomId: number; message: ChatMessage }) => {
        queryClient.setQueryData<InfiniteMessagesData>(
          QUERY_KEYS.chatKeys.messages(roomId).queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            const newPages = [...oldData.pages];
            newPages[0] = {
              ...newPages[0],
              messages: [message, ...newPages[0].messages],
            };
            return { ...oldData, pages: newPages };
          },
        );
        set((state) => ({
          isRoomInactive: { ...state.isRoomInactive, [roomId]: true },
        }));
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chatKeys.rooms.queryKey,
        });
      },
    );

    newSocket.on(
      'userRejoined',
      ({ roomId, message }: { roomId: number; message: ChatMessage }) => {
        // Add the system message to the message cache
        queryClient.setQueryData<InfiniteMessagesData>(
          QUERY_KEYS.chatKeys.messages(roomId).queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            const newPages = [...oldData.pages];
            newPages[0] = {
              ...newPages[0],
              messages: [message, ...newPages[0].messages],
            };
            return { ...oldData, pages: newPages };
          },
        );

        // Set the room back to active
        set((state) => ({
          isRoomInactive: { ...state.isRoomInactive, [roomId]: false },
        }));

        // Invalidate rooms query to get fresh participant data
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chatKeys.rooms.queryKey,
        });
      },
    );

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
        if (response.status !== "ok") {
          console.error("Message failed to send:", response.error);
          alert(`메시지 전송에 실패했습니다: ${response.error}`);
        }
      },
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

  leaveRoom: async (queryClient) => {
    const { activeChatRoomId, closeChatRoom } = get();
    if (!activeChatRoomId) return;

    try {
      await leaveChatRoom(activeChatRoomId);
      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldRooms) =>
          oldRooms
            ? oldRooms.filter((room) => room.id !== activeChatRoomId)
            : [],
      );
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.chatKeys.messages(activeChatRoomId).queryKey,
      });
      closeChatRoom();
    } catch (error) {
      console.error("Failed to leave room:", error);
      alert("채팅방을 나가는 데 실패했습니다.");
    }
  },

  subscribeToRoom: (roomId) => {
    const { socket } = get();
    if (socket) {
      socket.emit("subscribeToAllRooms", [roomId]); // Use existing event
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
          room.id === roomId ? { ...room, unreadCount: 0 } : room,
        );
      },
    );
  },
}));

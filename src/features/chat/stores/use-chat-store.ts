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
  isRoomInactive: { [roomId: number]: boolean }; // 채팅방 비활성 상태 추가

  connect: (queryClient: QueryClient) => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  emitStartTyping: () => void;
  emitStopTyping: () => void;
  leaveRoom: (queryClient: QueryClient) => void; // 채팅방 나가기 액션 추가

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
  isRoomInactive: {}, // 초기 상태

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
                const isMyMessage = newMessage.sender?.id === currentUser?.id;
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

    // 'userLeft' 이벤트 리스너 추가
    newSocket.on(
      "userLeft",
      ({ roomId, message }: { roomId: number; message: ChatMessage }) => {
        // 1. 해당 채팅방의 메시지 목록에 시스템 메시지 추가
        queryClient.setQueryData<InfiniteMessagesData>(
          QUERY_KEYS.chatKeys.messages(roomId).queryKey,
          (oldData) => {
            if (!oldData) return oldData;
            const newPages = [...oldData.pages];
            const latestPage = newPages[0] || {
              messages: [],
              hasNextPage: false,
            };
            newPages[0] = {
              ...latestPage,
              messages: [message, ...latestPage.messages],
            };
            return { ...oldData, pages: newPages };
          }
        );

        // 2. 채팅방 비활성화 상태로 변경
        set((state) => ({
          isRoomInactive: { ...state.isRoomInactive, [roomId]: true },
        }));

        // 3. 채팅방 목록 업데이트 (마지막 메시지 갱신)
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.chatKeys.rooms.queryKey,
        });
      }
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

  // 현재 활성화된 채팅방을 나가는 액션
  leaveRoom: async (queryClient) => {
    const { activeChatRoomId, closeChatRoom } = get();
    if (!activeChatRoomId) return;

    try {
      await leaveChatRoom(activeChatRoomId);

      // 채팅방 목록에서 해당 방 즉시 제거
      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldRooms) =>
          oldRooms
            ? oldRooms.filter((room) => room.id !== activeChatRoomId)
            : []
      );

      // 메시지 캐시도 제거
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.chatKeys.messages(activeChatRoomId).queryKey,
      });

      // 현재 열려있는 채팅방 닫기
      closeChatRoom();
    } catch (error) {
      console.error("Failed to leave room:", error);
      alert("채팅방을 나가는 데 실패했습니다.");
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

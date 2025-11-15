"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useAuthStore } from "@/features/auth/store";
import { ChatRoom } from "@/features/chat/types";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (accessToken) {
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL!}/chat`, {
        transports: ["websocket"],
        auth: {
          token: accessToken,
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connected", (data) => {
        console.log(data.message);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error.message);
      });

      setSocket(newSocket);

      return () => {
        console.log("Disconnecting socket...");
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [accessToken]);

  useEffect(() => {
    if (!socket) return;

    // 새 채팅방 생성 이벤트 수신
    socket.on("newChatRoom", (newRoom: ChatRoom) => {
      console.log("New chat room created:", newRoom);
      queryClient.setQueryData<ChatRoom[]>(
        QUERY_KEYS.chatKeys.rooms.queryKey,
        (oldData) => {
          if (oldData) {
            // 중복 추가 방지
            if (oldData.some((room) => room.id === newRoom.id)) {
              return oldData;
            }
            return [newRoom, ...oldData];
          }
          return [newRoom];
        }
      );
    });

    return () => {
      socket.off("newChatRoom");
    };
  }, [socket, queryClient]);

  const value = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

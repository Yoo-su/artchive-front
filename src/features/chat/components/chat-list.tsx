"use client";

import { ChatItem } from "./chat-item";
import { ChatListSkeleton } from "./skeleton";
import { ChatRoom } from "../types";
import { MessageSquareX } from "lucide-react";

interface ChatListProps {
  rooms: ChatRoom[];
  isLoading: boolean;
}
export const ChatList = ({ rooms, isLoading }: ChatListProps) => {
  if (isLoading) {
    return <ChatListSkeleton />;
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <MessageSquareX size={48} />
        <p className="mt-4">아직 대화가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold">채팅 목록</h3>
      </div>
      <div className="flex-grow overflow-y-auto">
        {rooms.map((room) => (
          <ChatItem key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

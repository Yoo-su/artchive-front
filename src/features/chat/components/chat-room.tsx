"use client";

import { ArrowLeft, Loader2,SendHorizontal } from "lucide-react";
import Image from "next/image";
import { useEffect, useLayoutEffect,useRef, useState } from "react";

import { useAuthStore } from "@/features/auth/store";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/shadcn/avatar";
import { Button } from "@/shared/components/shadcn/button";
import { Input } from "@/shared/components/shadcn/input";

import { useChatStore } from "../stores/use-chat-store";
import { ChatMessage, ChatRoom as ChatRoomType } from "../types";

// 개별 메시지 버블 UI 컴포넌트
const MessageBubble = ({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) => (
  <div
    className={`flex items-end gap-2 ${
      isMine ? "justify-end" : "justify-start"
    }`}
  >
    {!isMine && (
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender.profileImageUrl || ""} />
        <AvatarFallback>{message.sender.nickname.slice(0, 1)}</AvatarFallback>
      </Avatar>
    )}
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isMine
          ? "bg-violet-600 text-white rounded-br-none"
          : "bg-gray-100 text-gray-800 rounded-bl-none"
      }`}
    >
      <p className="text-sm">{message.content}</p>
    </div>
  </div>
);

// 부모(ChatWidget)로부터 받을 props 타입 정의
interface ChatRoomProps {
  room?: ChatRoomType;
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => void;
  fetchPreviousPage: () => void;
  hasPreviousPage?: boolean;
  isFetchingPreviousPage: boolean;
}

export const ChatRoom = ({
  room,
  messages,
  isLoading,
  sendMessage,
  fetchPreviousPage,
  hasPreviousPage,
  isFetchingPreviousPage,
}: ChatRoomProps) => {
  const { closeChatRoom } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<{ scrollHeight: number } | null>(null);

  const lastMessageIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (scrollRef.current && messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight -
        scrollRef.current.scrollHeight;
      scrollRef.current = null;
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // 마지막 메시지가 변경되었을 때만 (즉, 새 메시지가 도착했을 때만) 자동 스크롤
    if (lastMessage && lastMessage.id !== lastMessageIdRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      lastMessageIdRef.current = lastMessage.id;
    }
  }, [messages]);

  if (isLoading || !room || !currentUser) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const opponent = room.participants.find(
    (p) => p.user.id !== currentUser.id
  )?.user;

  const handleScroll = () => {
    if (
      messageContainerRef.current?.scrollTop === 0 &&
      hasPreviousPage &&
      !isFetchingPreviousPage
    ) {
      scrollRef.current = {
        scrollHeight: messageContainerRef.current.scrollHeight,
      };
      fetchPreviousPage();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-4 p-4 border-b flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={closeChatRoom}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="relative h-10 w-10 flex-shrink-0">
          <Image
            src={room.usedBookPost.book.image}
            alt={room.usedBookPost.book.title}
            fill
            className="rounded-md object-cover"
          />
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold truncate">{opponent?.nickname}</p>
          <p className="text-sm text-gray-500 truncate">
            {room.usedBookPost.title}
          </p>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex-grow overflow-y-auto p-4 space-y-4"
        ref={messageContainerRef}
        onScroll={handleScroll}
      >
        {isFetchingPreviousPage && (
          <div className="text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.sender.id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 폼 */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            autoComplete="off"
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <SendHorizontal size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

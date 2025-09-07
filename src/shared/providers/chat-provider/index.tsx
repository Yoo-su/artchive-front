"use client";

import { useAuthStore } from "@/features/auth/store";
import { ChatToggleButton } from "@/features/chat/components/chat-toggle-button";
import { ChatWidget } from "@/features/chat/components/chat-widget";

/**
 * 인증된 사용자에게만 채팅 관련 UI(토글 버튼, 위젯)를 렌더링하는 Provider
 */
export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();

  return (
    <>
      {children}
      {/* 유저 정보가 성공적으로 동기화되었을 때만 채팅 기능을 렌더링합니다. */}
      {user && (
        <>
          <ChatToggleButton />
          <ChatWidget />
        </>
      )}
    </>
  );
};

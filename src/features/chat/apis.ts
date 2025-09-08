import { privateAxios } from "@/shared/libs/axios";

import { ChatRoom, GetChatMessagesResponse } from "./types";

/**
 * 특정 판매글에 대한 채팅방을 찾거나 생성하는 API
 * @param postId - 판매글 ID
 */
export const findOrCreateRoom = async (postId: number): Promise<ChatRoom> => {
  const response = await privateAxios.post<ChatRoom>("/chat/rooms", { postId });
  return response.data;
};

/**
 * 현재 로그인한 유저의 모든 채팅방 목록을 조회하는 API
 */
export const getMyChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await privateAxios.get<ChatRoom[]>("/chat/rooms");
  return response.data;
};

/**
 * 특정 채팅방의 메시지 목록을 페이지네이션으로 조회하는 API
 */
export const getChatMessages = async (
  roomId: number,
  page: number,
  limit: number = 20
): Promise<GetChatMessagesResponse> => {
  const response = await privateAxios.get<GetChatMessagesResponse>(
    `/chat/rooms/${roomId}/messages`,
    { params: { page, limit } }
  );
  return response.data;
};

/**
 * 특정 채팅방의 메시지를 모두 읽음으로 처리하는 API 함수
 */
export const markMessagesAsRead = async (roomId: number) => {
  const response = await privateAxios.patch(`/chat/rooms/${roomId}/read`);
  return response.data;
};

/**
 * 채팅방을 나가는 API
 * @param roomId - 나갈 채팅방의 ID
 */
export const leaveChatRoom = async (roomId: number) => {
  const response = await privateAxios.delete(`/chat/rooms/${roomId}`);
  return response.data;
};

import { create } from "zustand";

interface ChatUIState {
  isChatOpen: boolean;
  activeChatRoomId: number | null;

  toggleChat: () => void;
  openChatRoom: (roomId: number) => void;
  closeChatRoom: () => void;
}

export const useChatStore = create<ChatUIState>((set) => ({
  isChatOpen: false,
  activeChatRoomId: null,

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  openChatRoom: (roomId) => set({ activeChatRoomId: roomId, isChatOpen: true }),

  closeChatRoom: () => set({ activeChatRoomId: null }),
}));

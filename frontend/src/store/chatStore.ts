import { create } from 'zustand';
import { Conversation, Message, User } from '../types';

interface TypingUser {
  userId: string;
  isTyping: boolean;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, TypingUser>;
  onlineUsers: Set<string>;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  updateTypingUser: (conversationId: string, typingUser: TypingUser) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set<string>(),

  setConversations: (conversations: Conversation[]) => set({ conversations }),

  setCurrentConversation: (conversation: Conversation | null) => set({ currentConversation: conversation }),

  addMessage: (conversationId: string, message: Message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  setMessages: (conversationId: string, messages: Message[]) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  updateTypingUser: (conversationId: string, typingUser: TypingUser) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [`${conversationId}-${typingUser.userId}`]: typingUser,
      },
    })),

  addOnlineUser: (userId: string) =>
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    })),

  removeOnlineUser: (userId: string) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    }),

  addConversation: (conversation: Conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (conversationId: string, updates: Partial<Conversation>) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates } : conv,
      ),
      currentConversation:
        state.currentConversation?.id === conversationId
          ? { ...state.currentConversation, ...updates }
          : state.currentConversation,
    })),
}));

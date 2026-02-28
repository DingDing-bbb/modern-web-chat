export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away';
  emailVerified: 'verified' | 'unverified';
  createdAt: string;
  updatedAt: string;
  lastSeen?: string;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  senderId: string;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  avatar: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  participants: User[];
  messages?: Message[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    status: string;
    emailVerified: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface TypingUser {
  userId: string;
  isTyping: boolean;
}

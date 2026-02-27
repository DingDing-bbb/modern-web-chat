import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io('/', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      query: { XTransformPort: '3001' },
      auth: { token },
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('new:message', (message: any) => {
      useChatStore.getState().addMessage(message.conversationId, message);
      useChatStore.getState().updateConversation(message.conversationId, {
        updatedAt: new Date().toISOString(),
      });
    });

    this.socket.on('user:typing', (data: { userId: string; isTyping: boolean }) => {
      const state = useChatStore.getState();
      if (state.currentConversation) {
        state.updateTypingUser(state.currentConversation.id, data);
      }
    });

    this.socket.on('user:online', (data: { userId: string; username: string }) => {
      useChatStore.getState().addOnlineUser(data.userId);
    });

    this.socket.on('user:offline', (data: { userId: string; username: string }) => {
      useChatStore.getState().removeOnlineUser(data.userId);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('join:conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave:conversation', { conversationId });
  }

  sendMessage(data: { content: string; type?: string; conversationId: string; metadata?: any }) {
    this.socket?.emit('send:message', data);
  }

  startTyping(conversationId: string) {
    this.socket?.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing:stop', { conversationId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket() {
    return this.socket;
  }
}

export const websocketService = new WebSocketService();

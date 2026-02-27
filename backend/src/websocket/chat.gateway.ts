import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, string> = new Map();

  private jwtService: JwtService;
  private chatService: ChatService;
  private usersService: UsersService;

  constructor(private moduleRef: ModuleRef) {}

  private async getServices(): Promise<void> {
    if (!this.jwtService) {
      this.jwtService = this.moduleRef.get(JwtService);
      this.chatService = this.moduleRef.get(ChatService);
      this.usersService = this.moduleRef.get(UsersService);
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      await this.getServices();

      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Connection attempt without token, disconnecting');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      await this.usersService.updateStatus(userId, 'online');

      const conversations = await this.chatService.getUserConversations(userId);

      conversations.forEach((conversation) => {
        const room = `conversation:${conversation.id}`;
        client.join(room);
      });

      const user = await this.usersService.findOne(userId);
      this.server.emit('user:online', { userId, username: user.username });

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data.userId;

    if (userId) {
      this.connectedUsers.delete(userId);
      try {
        await this.getServices();
        await this.usersService.updateStatus(userId, 'offline');
        const user = await this.usersService.findOne(userId);
        this.server.emit('user:offline', { userId, username: user.username });
      } catch (error) {
        this.logger.error('Error handling disconnect:', error);
      }

      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join:conversation')
  async handleJoinConversation(client: Socket, payload: { conversationId: string }): Promise<void> {
    const { conversationId } = payload;
    const room = `conversation:${conversationId}`;
    client.join(room);
    client.emit('joined:conversation', { conversationId });
    this.logger.log(`User ${client.data.userId} joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('leave:conversation')
  async handleLeaveConversation(client: Socket, payload: { conversationId: string }): Promise<void> {
    const { conversationId } = payload;
    const room = `conversation:${conversationId}`;
    client.leave(room);
    client.emit('left:conversation', { conversationId });
    this.logger.log(`User ${client.data.userId} left conversation: ${conversationId}`);
  }

  @SubscribeMessage('send:message')
  async handleMessage(client: Socket, payload: { content: string; type?: string; conversationId: string; metadata?: any }): Promise<void> {
    const senderId = client.data.userId;

    if (!senderId) {
      this.logger.warn('Message attempt without userId');
      return;
    }

    try {
      await this.getServices();
      const message = await this.chatService.createMessage({
        content: payload.content,
        type: payload.type,
        senderId,
        conversationId: payload.conversationId,
        metadata: payload.metadata,
      });

      const room = `conversation:${payload.conversationId}`;
      this.server.to(room).emit('new:message', message);
      this.logger.log(`Message sent by user ${senderId} in conversation ${payload.conversationId}`);
    } catch (error) {
      this.logger.error('Error sending message:', error);
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(client: Socket, payload: { conversationId: string }): Promise<void> {
    const room = `conversation:${payload.conversationId}`;
    client.to(room).emit('user:typing', {
      userId: client.data.userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(client: Socket, payload: { conversationId: string }): Promise<void> {
    const room = `conversation:${payload.conversationId}`;
    client.to(room).emit('user:typing', {
      userId: client.data.userId,
      isTyping: false,
    });
  }
}

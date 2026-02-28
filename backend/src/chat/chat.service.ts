import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '../users/entities/user.entity';

export interface CreateConversationDto {
  name?: string;
  type: string;
  participantIds: string[];
  creatorId: string;
}

export interface CreateMessageDto {
  content: string;
  type?: string;
  senderId: string;
  conversationId: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    this.logger.log(`Creating conversation for user: ${createConversationDto.creatorId}`);
    
    const { name, type, participantIds, creatorId } = createConversationDto;

    const participants = await Promise.all(
      participantIds.map(async (id) => {
        const user = await this.conversationRepository.manager.getRepository(User).findOne({ where: { id } });
        if (!user) {
          this.logger.warn(`Participant not found: ${id}`);
        }
        return user;
      }),
    );

    const missingParticipants = participants.filter((p) => !p);
    if (missingParticipants.length > 0) {
      this.logger.warn(`Some participants not found`);
      throw new NotFoundException('One or more participants not found');
    }

    if (!participants.find((p) => p.id === creatorId)) {
      const creator = await this.conversationRepository.manager.getRepository(User).findOne({
        where: { id: creatorId },
      });
      if (creator) {
        participants.push(creator);
      }
    }

    const conversation = this.conversationRepository.create({
      name,
      type,
      creatorId,
      participants,
    });

    const savedConversation = await this.conversationRepository.save(conversation);
    this.logger.log(`Conversation created successfully: ${savedConversation.id}`);
    return savedConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    this.logger.log(`Fetching conversations for user: ${userId}`);
    
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('conversation.messages', 'messages', 'messages.id = :lastMessageId', {
        lastMessageId: null,
      })
      .where('participants.id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  async getConversationById(id: string, userId: string): Promise<Conversation> {
    this.logger.log(`Fetching conversation: ${id} for user: ${userId}`);
    
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['participants', 'messages', 'messages.sender'],
    });

    if (!conversation) {
      this.logger.warn(`Conversation not found: ${id}`);
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);

    if (!isParticipant) {
      this.logger.warn(`User ${userId} denied access to conversation ${id}`);
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    this.logger.log(`Creating message in conversation: ${createMessageDto.conversationId}`);
    
    const { content, type = 'text', senderId, conversationId, metadata } = createMessageDto;

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      this.logger.warn(`Conversation not found: ${conversationId}`);
      throw new NotFoundException('Conversation not found');
    }

    const message = this.messageRepository.create({
      content,
      type,
      senderId,
      conversationId,
      metadata,
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.conversationRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    this.logger.log(`Message created successfully: ${savedMessage.id}`);
    return savedMessage;
  }

  async getConversationMessages(conversationId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    this.logger.log(`Fetching messages for conversation: ${conversationId}`);
    
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      this.logger.warn(`Conversation not found: ${conversationId}`);
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);

    if (!isParticipant) {
      this.logger.warn(`User ${userId} denied access to conversation ${conversationId}`);
      throw new ForbiddenException('Access denied');
    }

    return this.messageRepository.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    this.logger.log(`Marking messages as read for conversation: ${conversationId}`);
    
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      this.logger.warn(`Conversation not found: ${conversationId}`);
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);

    if (!isParticipant) {
      this.logger.warn(`User ${userId} denied access to conversation ${conversationId}`);
      throw new ForbiddenException('Access denied');
    }

    await this.messageRepository.update(
      {
        conversationId,
        senderId: userId,
      },
      {
        isRead: true,
      },
    );
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    this.logger.log(`Deleting message: ${messageId}`);
    
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      this.logger.warn(`Message not found: ${messageId}`);
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      this.logger.warn(`User ${userId} denied access to delete message ${messageId}`);
      throw new ForbiddenException('Access denied');
    }

    await this.messageRepository.remove(message);
    this.logger.log(`Message deleted successfully: ${messageId}`);
  }
}

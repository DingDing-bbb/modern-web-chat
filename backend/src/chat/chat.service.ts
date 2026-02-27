import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { name, type, participantIds, creatorId } = createConversationDto;

    const participants = await Promise.all(
      participantIds.map((id) =>
        this.conversationRepository.manager.getRepository(User).findOne({ where: { id } }),
      ),
    );

    if (participants.some((p) => !p)) {
      throw new NotFoundException('One or more participants not found');
    }

    if (!participants.find((p) => p.id === creatorId)) {
      participants.push(
        await this.conversationRepository.manager.getRepository(User).findOne({
          where: { id: creatorId },
        }),
      );
    }

    const conversation = this.conversationRepository.create({
      name,
      type,
      creatorId,
      participants,
    });

    return this.conversationRepository.save(conversation);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
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
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['participants', 'messages', 'messages.sender'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);

    if (!isParticipant) {
      throw new ForbiddenException('Access denied');
    }

    return conversation;
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { content, type = 'text', senderId, conversationId, metadata } = createMessageDto;

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
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

    return savedMessage;
  }

  async getConversationMessages(conversationId: string, userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);

    if (!isParticipant) {
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
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) => p.id === userId);

    if (!isParticipant) {
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
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.messageRepository.remove(message);
  }
}

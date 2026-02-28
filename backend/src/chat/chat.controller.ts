import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query, Put } from '@nestjs/common';
import { ChatService, CreateConversationDto, CreateMessageDto } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createConversation(@Body() createConversationDto: CreateConversationDto, @Request() req) {
    return this.chatService.createConversation({
      ...createConversationDto,
      creatorId: req.user.userId,
    });
  }

  @Get('conversations')
  getConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.userId);
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string, @Request() req) {
    return this.chatService.getConversationById(id, req.user.userId);
  }

  @Post('messages')
  createMessage(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    return this.chatService.createMessage({
      ...createMessageDto,
      senderId: req.user.userId,
    });
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getConversationMessages(
      id,
      req.user.userId,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }

  @Put('conversations/:id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.chatService.markMessagesAsRead(id, req.user.userId);
  }

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string, @Request() req) {
    return this.chatService.deleteMessage(id, req.user.userId);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Message } from '../chat/entities/message.entity';
import { Conversation } from '../chat/entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DATABASE_PATH || '/home/z/my-project/db/chatapp.db',
      entities: [User, Message, Conversation],
      synchronize: true,
      logging: false,
    }),
  ],
})
export class DatabaseModule {}

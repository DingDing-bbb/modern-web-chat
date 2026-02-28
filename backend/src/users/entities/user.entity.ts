import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from '../../chat/entities/message.entity';
import { Conversation } from '../../chat/entities/conversation.entity';

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
}

export enum EmailVerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: 'unverified',
  })
  emailVerified: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'varchar',
    default: 'offline',
  })
  status: string;

  @Column({ nullable: true })
  lastSeen: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Conversation, (conversation) => conversation.creator)
  createdConversations: Conversation[];
}

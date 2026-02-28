import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  avatar?: string;
  status?: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${createUserDto.username}`);
    
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: createUserDto.username }, { email: createUserDto.email }],
    });

    if (existingUser) {
      if (existingUser.username === createUserDto.username) {
        this.logger.warn(`Username already exists: ${createUserDto.username}`);
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === createUserDto.email) {
        this.logger.warn(`Email already exists: ${createUserDto.email}`);
        throw new ConflictException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      emailVerified: 'unverified',
    });

    const savedUser = await this.usersRepository.save(user);
    this.logger.log(`User created successfully: ${savedUser.id}`);
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.usersRepository.find({
      select: ['id', 'username', 'email', 'avatar', 'status', 'lastSeen', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user: ${id}`);
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'avatar', 'status', 'lastSeen', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      this.logger.warn(`User not found: ${id}`);
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    this.logger.log(`Finding user by username: ${username}`);
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user: ${id}`);
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(`User updated successfully: ${id}`);
    return updatedUser;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    this.logger.log(`Updating user status: ${id} -> ${status}`);
    await this.usersRepository.update(id, {
      status,
      lastSeen: new Date(),
    });
  }

  async verifyEmail(email: string): Promise<void> {
    this.logger.log(`Verifying email for user: ${email}`);
    await this.usersRepository.update({ email }, { emailVerified: 'verified' });
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    this.logger.log(`User deleted successfully: ${id}`);
  }
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserInput {
  fullName: string;
  password: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  createdAt: Date;
}

export class UserModel {
  static async create(userData: CreateUserInput): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        fullName: userData.fullName,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        createdAt: true,
      }
    });
    
    return user;
  }

  static async findByFullName(fullName: string) {
    return await prisma.user.findUnique({
      where: { fullName },
    });
  }

  static async validatePassword(user: any, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password);
  }

  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: {
        fullName: 'asc',
      }
    });
    
    return users;
  }
}
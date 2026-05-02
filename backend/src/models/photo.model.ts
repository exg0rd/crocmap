import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePhotoInput {
  tripId: string;
  filename: string;
  url: string;
  caption?: string;
}

export interface PhotoResponse {
  id: string;
  tripId: string;
  filename: string;
  url: string;
  caption?: string | null;
  createdAt: Date;
}

export class PhotoModel {
  static async create(photoData: CreatePhotoInput): Promise<PhotoResponse> {
    const photo = await prisma.photo.create({
      data: photoData,
    });
    
    return photo;
  }

  static async findByTripId(tripId: string): Promise<PhotoResponse[]> {
    const photos = await prisma.photo.findMany({
      where: { tripId },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return photos;
  }

  static async findById(id: string): Promise<PhotoResponse | null> {
    const photo = await prisma.photo.findUnique({
      where: { id },
    });
    
    return photo;
  }

  static async delete(id: string, tripId: string): Promise<boolean> {
    const photo = await prisma.photo.findFirst({
      where: { id, tripId },
    });
    
    if (!photo) {
      return false;
    }
    
    await prisma.photo.delete({
      where: { id },
    });
    
    return true;
  }

  static async updateCaption(id: string, caption: string): Promise<PhotoResponse | null> {
    const photo = await prisma.photo.update({
      where: { id },
      data: { caption },
    });
    
    return photo;
  }
}

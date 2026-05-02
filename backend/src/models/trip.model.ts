import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTripInput {
  userId: string;
  city: string;
  arrivalDate: Date;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateTripInput {
  city?: string;
  arrivalDate?: Date;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface TripResponse {
  id: string;
  userId: string;
  city: string;
  arrivalDate: Date;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string;
  };
}

export interface TripFilter {
  city?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class TripModel {
  static async create(tripData: CreateTripInput): Promise<TripResponse> {
    const trip = await prisma.trip.create({
      data: tripData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    });
    
    return trip;
  }

  static async findById(id: string): Promise<TripResponse | null> {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    });
    
    return trip;
  }

  static async findByUserId(userId: string): Promise<TripResponse[]> {
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          }
        }
      },
      orderBy: {
        arrivalDate: 'desc',
      }
    });
    
    return trips;
  }

  static async findAll(filters?: TripFilter): Promise<TripResponse[]> {
    const where: any = {};
    
    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    
    if (filters?.startDate || filters?.endDate) {
      where.arrivalDate = {};
      
      if (filters.startDate) {
        where.arrivalDate.gte = filters.startDate;
      }
      
      if (filters.endDate) {
        where.arrivalDate.lte = filters.endDate;
      }
    }
    
    const trips = await prisma.trip.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          }
        }
      },
      orderBy: {
        arrivalDate: 'desc',
      }
    });
    
    return trips;
  }

  static async update(id: string, userId: string, tripData: UpdateTripInput): Promise<TripResponse | null> {
    const trip = await prisma.trip.findFirst({
      where: { id, userId }
    });
    
    if (!trip) {
      return null;
    }
    
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: tripData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          }
        }
      }
    });
    
    return updatedTrip;
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const trip = await prisma.trip.findFirst({
      where: { id, userId }
    });
    
    if (!trip) {
      return false;
    }
    
    await prisma.trip.delete({
      where: { id }
    });
    
    return true;
  }

  static async getCities(): Promise<string[]> {
    const cities = await prisma.trip.findMany({
      select: {
        city: true,
      },
      distinct: ['city'],
      orderBy: {
        city: 'asc',
      }
    });
    
    return cities.map(city => city.city);
  }
}
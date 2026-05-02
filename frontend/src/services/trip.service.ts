import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Trip {
  id: string;
  userId: string;
  city: string;
  arrivalDate: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
  };
}

export interface CreateTripData {
  city: string;
  arrivalDate: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateTripData {
  city?: string;
  arrivalDate?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface TripFilters {
  city?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

class TripService {
  private api = axios.create({
    baseURL: API_URL,
  });

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async createTrip(tripData: CreateTripData): Promise<Trip> {
    const response = await this.api.post<Trip>('/trips', tripData);
    return response.data;
  }

  async getTrips(filters?: TripFilters): Promise<Trip[]> {
    const params = new URLSearchParams();
    
    if (filters?.city) params.append('city', filters.city);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await this.api.get<Trip[]>('/trips', { params });
    return response.data;
  }

  async getMyTrips(): Promise<Trip[]> {
    const response = await this.api.get<Trip[]>('/trips/my');
    return response.data;
  }

  async updateTrip(id: string, tripData: UpdateTripData): Promise<Trip> {
    const response = await this.api.put<Trip>(`/trips/${id}`, tripData);
    return response.data;
  }

  async deleteTrip(id: string): Promise<void> {
    await this.api.delete(`/trips/${id}`);
  }

  async getCities(): Promise<string[]> {
    const response = await this.api.get<string[]>('/trips/cities');
    return response.data;
  }
}

export default new TripService();
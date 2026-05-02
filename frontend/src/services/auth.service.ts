import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    createdAt: string;
  };
  token: string;
}

export interface RegisterResponse extends LoginResponse {}

class AuthService {
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

  async login(fullName: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', {
      fullName,
      password,
    });
    return response.data;
  }

  async register(fullName: string, password: string): Promise<RegisterResponse> {
    const response = await this.api.post<RegisterResponse>('/auth/register', {
      fullName,
      password,
    });
    return response.data;
  }

  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    // Decode token to get user info (simplified - in real app would call API)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.userId,
        fullName: payload.fullName,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getUsers() {
    const response = await this.api.get('/auth/users');
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
  }
}

export default new AuthService();
import { api } from './api';
import { User, ApiResponse } from '../types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    return response.data.data;
  },

  updateUser: async (
    id: string,
    userData: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    }
  ): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

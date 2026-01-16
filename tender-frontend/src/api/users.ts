import api from './client';
import { User, ProfileUpdateRequest } from '../types';

export const usersApi = {
  async getMe(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  async updateMe(data: ProfileUpdateRequest): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },
};

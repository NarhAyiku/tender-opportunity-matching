import api from './client';
import { Swipe, SwipeRequest, SwipeStats, SwipeAction } from '../types';

export const swipesApi = {
  async recordSwipe(data: SwipeRequest): Promise<Swipe> {
    const response = await api.post<Swipe>('/swipes', data);
    return response.data;
  },

  async getSwipes(action?: SwipeAction): Promise<Swipe[]> {
    const params = action ? { action } : {};
    const response = await api.get<Swipe[]>('/swipes', { params });
    return response.data;
  },

  async getSaved(): Promise<Swipe[]> {
    const response = await api.get<Swipe[]>('/swipes/saved');
    return response.data;
  },

  async getLiked(): Promise<Swipe[]> {
    const response = await api.get<Swipe[]>('/swipes/liked');
    return response.data;
  },

  async getStats(): Promise<SwipeStats> {
    const response = await api.get<SwipeStats>('/swipes/stats');
    return response.data;
  },

  async deleteSwipe(id: number): Promise<void> {
    await api.delete(`/swipes/${id}`);
  },

  async getPending(): Promise<Swipe[]> {
    const response = await api.get<Swipe[]>('/swipes/pending');
    return response.data;
  },

  async approveSwipe(id: number): Promise<Swipe> {
    const response = await api.post<Swipe>(`/swipes/${id}/approve`);
    return response.data;
  },

  async editSwipe(id: number, editedData: Record<string, any>): Promise<Swipe> {
    const response = await api.post<Swipe>(`/swipes/${id}/edit`, { edited_data: editedData });
    return response.data;
  },
};

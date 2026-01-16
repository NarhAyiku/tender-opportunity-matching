import api from './client';
import { UserPreferences, PreferencesUpdateRequest } from '../types';

export const preferencesApi = {
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<UserPreferences>('/preferences/me');
    return response.data;
  },

  async updatePreferences(data: PreferencesUpdateRequest): Promise<UserPreferences> {
    const response = await api.put<UserPreferences>('/preferences/me', data);
    return response.data;
  },
};

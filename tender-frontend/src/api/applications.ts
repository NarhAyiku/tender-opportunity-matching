import api from './client';
import { Application, ApplicationStatus } from '../types';

export interface ApplicationsParams {
  status?: ApplicationStatus;
  skip?: number;
  limit?: number;
}

export const applicationsApi = {
  async getApplications(params: ApplicationsParams = {}): Promise<Application[]> {
    const response = await api.get<Application[]>('/applications', { params });
    return response.data;
  },

  async getApplication(id: number): Promise<Application> {
    const response = await api.get<Application>(`/applications/${id}`);
    return response.data;
  },

  async updateApplication(
    id: number,
    data: { status?: ApplicationStatus; notes?: string; cover_letter?: string }
  ): Promise<Application> {
    const response = await api.put<Application>(`/applications/${id}`, data);
    return response.data;
  },

  async submitApplication(id: number): Promise<Application> {
    const response = await api.post<Application>(`/applications/${id}/submit`);
    return response.data;
  },

  async withdrawApplication(id: number): Promise<Application> {
    const response = await api.post<Application>(`/applications/${id}/withdraw`);
    return response.data;
  },
};

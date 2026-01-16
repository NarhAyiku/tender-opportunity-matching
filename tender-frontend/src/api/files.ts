import api from './client';

export const filesApi = {
  async uploadResume(file: File): Promise<{ filename: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ filename: string; message: string }>(
      '/files/resume',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async uploadTranscript(file: File): Promise<{ filename: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ filename: string; message: string }>(
      '/files/transcript',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async uploadProfilePicture(file: File): Promise<{ filename: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ filename: string; message: string }>(
      '/files/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getResumeUrl(): string {
    return `${api.defaults.baseURL}/files/resume`;
  },

  getTranscriptUrl(): string {
    return `${api.defaults.baseURL}/files/transcript`;
  },
};

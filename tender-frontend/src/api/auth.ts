import api from './client';

export interface LoginRequest {
  username: string; // FastAPI OAuth2 uses username field for email
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async signup(data: SignupRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/signup', data);
    return response.data;
  },
};

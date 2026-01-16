import api from './client';
import { OpportunityMatch } from '../types';

export interface FeedParams {
  limit?: number;
  opportunity_type?: string;
}

export const feedApi = {
  async getFeed(params: FeedParams = {}): Promise<OpportunityMatch[]> {
    const response = await api.get<OpportunityMatch[]>('/match/feed', { params });
    return response.data;
  },
};

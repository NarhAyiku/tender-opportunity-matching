import api from './client';
import { Conversation, ConversationEvent } from '../types';

export const conversationsApi = {
    async getConversations(type?: string): Promise<Conversation[]> {
        const params = type ? { conv_type: type } : {};
        const response = await api.get<Conversation[]>('/conversations/', { params });
        return response.data;
    },

    async getConversation(id: number): Promise<Conversation> {
        const response = await api.get<Conversation>(`/conversations/${id}`);
        return response.data;
    },

    async getConversationEvents(id: number): Promise<ConversationEvent[]> {
        const response = await api.get<ConversationEvent[]>(`/conversations/${id}/events`);
        return response.data;
    },
};

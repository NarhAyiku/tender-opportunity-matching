import api from './client';
import { ParseResult, ApplyParsedDataRequest } from '../types/document';

export const documentApi = {
    // Parsing endpoints
    parseResume: async (): Promise<ParseResult> => {
        const response = await api.post<ParseResult>('/files/resume/parse');
        return response.data;
    },

    parseTranscript: async (): Promise<ParseResult> => {
        const response = await api.post<ParseResult>('/files/transcript/parse');
        return response.data;
    },

    getParseResult: async (parseId: number): Promise<ParseResult> => {
        const response = await api.get<ParseResult>(`/files/parse/${parseId}`);
        return response.data;
    },

    applyParsedData: async (data: ApplyParsedDataRequest): Promise<{ message: string }> => {
        const response = await api.post('/profile/apply-parsed', data);
        return response.data;
    },
};

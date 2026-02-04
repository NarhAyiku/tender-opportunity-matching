export interface ConversationEvent {
    id: number;
    conversation_id: number;
    kind: string;
    status?: string;
    message?: string;
    actor: string;
    created_at: string;
}

export interface Conversation {
    id: number;
    user_id: number;
    application_id?: number;
    opportunity_id?: number;
    type: string;
    last_message_at?: string;
    unread_count: number;
    created_at: string;
    events?: ConversationEvent[];
    // Populated from join
    opportunity?: {
        id: number;
        title: string;
        company_name?: string;
        company_logo_url?: string;
    };
}

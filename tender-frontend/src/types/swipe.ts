export type SwipeAction = 'like' | 'dislike' | 'save';

export interface Swipe {
  id: number;
  user_id: number;
  opportunity_id: number;
  action: SwipeAction;
  created_at: string;
  status?: string;
  preview_data?: Record<string, any>;
  edited_data?: Record<string, any>;
  opportunity?: {
    id: number;
    title: string;
    company_name?: string;
    company_logo_url?: string;
    city?: string;
    country?: string;
    is_remote?: boolean;
    opportunity_type?: string;
    description?: string;
  };
}

export interface SwipeRequest {
  opportunity_id: number;
  action: SwipeAction;
}

export interface SwipeStats {
  total_swipes: number;
  likes: number;
  dislikes: number;
  saves: number;
}

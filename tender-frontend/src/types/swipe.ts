export type SwipeAction = 'like' | 'dislike' | 'save';

export interface Swipe {
  id: number;
  user_id: number;
  opportunity_id: number;
  action: SwipeAction;
  created_at: string;
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

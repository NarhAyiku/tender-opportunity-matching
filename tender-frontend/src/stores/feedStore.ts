import { create } from 'zustand';
import { OpportunityMatch, SwipeAction } from '../types';
import { feedApi, swipesApi } from '../api';

interface FeedState {
  opportunities: OpportunityMatch[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;

  fetchFeed: (limit?: number) => Promise<void>;
  swipe: (opportunityId: number, action: SwipeAction) => Promise<void>;
  nextCard: () => void;
  reset: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  opportunities: [],
  currentIndex: 0,
  isLoading: false,
  error: null,

  fetchFeed: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const opportunities = await feedApi.getFeed({ limit });
      set({ opportunities, currentIndex: 0, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({
        error: error.response?.data?.detail || 'Failed to load feed',
        isLoading: false,
      });
    }
  },

  swipe: async (opportunityId: number, action: SwipeAction) => {
    try {
      await swipesApi.recordSwipe({ opportunity_id: opportunityId, action });
      get().nextCard();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error('Swipe failed:', error);
    }
  },

  nextCard: () => {
    const { currentIndex, opportunities } = get();
    if (currentIndex < opportunities.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      // Reached end of feed, could trigger reload
      set({ opportunities: [], currentIndex: 0 });
    }
  },

  reset: () => set({ opportunities: [], currentIndex: 0, error: null }),
}));

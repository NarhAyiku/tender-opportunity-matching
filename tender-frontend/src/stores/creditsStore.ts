import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditsState {
    // Credits balance
    credits: number;
    freeSwipesToday: number;
    lastFreeSwipeDate: string | null;

    // Actions
    useCredit: () => boolean;
    addCredits: (amount: number) => void;
    claimFreeSwipes: () => void;
    claimSocialReward: (platform: string) => void;

    // Social rewards tracking
    claimedSocialRewards: string[];

    // Computed
    canSwipe: () => boolean;
    resetDailySwipes: () => void;
}

const FREE_SWIPES_PER_DAY = 5;
const SOCIAL_REWARD_CREDITS = 2;

export const useCreditsStore = create<CreditsState>()(
    persist(
        (set, get) => ({
            credits: 10, // Starting credits
            freeSwipesToday: FREE_SWIPES_PER_DAY,
            lastFreeSwipeDate: null,
            claimedSocialRewards: [],

            useCredit: () => {
                const state = get();

                // First use free swipes
                if (state.freeSwipesToday > 0) {
                    set({ freeSwipesToday: state.freeSwipesToday - 1 });
                    return true;
                }

                // Then use paid credits
                if (state.credits > 0) {
                    set({ credits: state.credits - 1 });
                    return true;
                }

                return false; // No credits available
            },

            addCredits: (amount: number) => {
                set((state) => ({ credits: state.credits + amount }));
            },

            claimFreeSwipes: () => {
                const today = new Date().toDateString();
                const state = get();

                if (state.lastFreeSwipeDate !== today) {
                    set({
                        freeSwipesToday: FREE_SWIPES_PER_DAY,
                        lastFreeSwipeDate: today,
                    });
                }
            },

            claimSocialReward: (platform: string) => {
                const state = get();
                if (!state.claimedSocialRewards.includes(platform)) {
                    set({
                        credits: state.credits + SOCIAL_REWARD_CREDITS,
                        claimedSocialRewards: [...state.claimedSocialRewards, platform],
                    });
                }
            },

            canSwipe: () => {
                const state = get();
                return state.freeSwipesToday > 0 || state.credits > 0;
            },

            resetDailySwipes: () => {
                const today = new Date().toDateString();
                const state = get();

                if (state.lastFreeSwipeDate !== today) {
                    set({
                        freeSwipesToday: FREE_SWIPES_PER_DAY,
                        lastFreeSwipeDate: today,
                    });
                }
            },
        }),
        {
            name: 'credits-storage',
        }
    )
);

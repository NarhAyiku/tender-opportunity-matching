import { create } from 'zustand';
import { Candidate, CandidateFilters, CandidateStatus, RecruiterMetrics } from '../types/recruiter';
import { mockCandidates, mockMetrics } from '../lib/mockData';

interface RecruiterState {
    candidates: Candidate[];
    metrics: RecruiterMetrics;
    filters: CandidateFilters;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchCandidates: () => Promise<void>;
    updateCandidateStatus: (candidateId: string, newStatus: CandidateStatus) => void;
    setFilters: (filters: Partial<CandidateFilters>) => void;
    getFilteredCandidates: () => Candidate[];
    getCandidatesByStatus: (status: CandidateStatus) => Candidate[];
}

export const useRecruiterStore = create<RecruiterState>((set, get) => ({
    candidates: [],
    metrics: mockMetrics,
    filters: {},
    isLoading: false,
    error: null,

    fetchCandidates: async () => {
        set({ isLoading: true, error: null });
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            set({ candidates: mockCandidates, isLoading: false });
        } catch (_error) {
            set({ error: 'Failed to fetch candidates', isLoading: false });
        }
    },

    updateCandidateStatus: (candidateId: string, newStatus: CandidateStatus) => {
        set(state => ({
            candidates: state.candidates.map(candidate =>
                candidate.id === candidateId
                    ? { ...candidate, status: newStatus }
                    : candidate
            ),
        }));
    },

    setFilters: (newFilters: Partial<CandidateFilters>) => {
        set(state => ({
            filters: { ...state.filters, ...newFilters },
        }));
    },

    getFilteredCandidates: () => {
        const { candidates, filters } = get();
        return candidates.filter(candidate => {
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesSearch =
                    candidate.name.toLowerCase().includes(searchLower) ||
                    candidate.email.toLowerCase().includes(searchLower) ||
                    candidate.skills.some(skill => skill.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }

            if (filters.minFitScore !== undefined && candidate.fitScore < filters.minFitScore) {
                return false;
            }

            if (filters.source && candidate.source !== filters.source) {
                return false;
            }

            if (filters.status && candidate.status !== filters.status) {
                return false;
            }

            if (filters.dateRange) {
                const appliedDate = new Date(candidate.appliedAt);
                const start = new Date(filters.dateRange.start);
                const end = new Date(filters.dateRange.end);
                if (appliedDate < start || appliedDate > end) {
                    return false;
                }
            }

            return true;
        });
    },

    getCandidatesByStatus: (status: CandidateStatus) => {
        const filtered = get().getFilteredCandidates();
        return filtered.filter(candidate => candidate.status === status);
    },
}));

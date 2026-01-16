import { create } from 'zustand';
import { Application, ApplicationStatus } from '../types';
import { applicationsApi } from '../api';

interface ApplicationsState {
  applications: Application[];
  selectedApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  filter: ApplicationStatus | null;

  fetchApplications: (status?: ApplicationStatus) => Promise<void>;
  fetchApplication: (id: number) => Promise<void>;
  submitApplication: (id: number) => Promise<void>;
  withdrawApplication: (id: number) => Promise<void>;
  setFilter: (status: ApplicationStatus | null) => void;
  clearSelected: () => void;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,
  filter: null,

  fetchApplications: async (status?: ApplicationStatus) => {
    set({ isLoading: true, error: null });
    try {
      const applications = await applicationsApi.getApplications({ status });
      set({ applications, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({
        error: error.response?.data?.detail || 'Failed to load applications',
        isLoading: false,
      });
    }
  },

  fetchApplication: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const application = await applicationsApi.getApplication(id);
      set({ selectedApplication: application, isLoading: false });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({
        error: error.response?.data?.detail || 'Failed to load application',
        isLoading: false,
      });
    }
  },

  submitApplication: async (id: number) => {
    try {
      const updated = await applicationsApi.submitApplication(id);
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? updated : app
        ),
        selectedApplication:
          state.selectedApplication?.id === id ? updated : state.selectedApplication,
      }));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({ error: error.response?.data?.detail || 'Failed to submit application' });
    }
  },

  withdrawApplication: async (id: number) => {
    try {
      const updated = await applicationsApi.withdrawApplication(id);
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? updated : app
        ),
        selectedApplication:
          state.selectedApplication?.id === id ? updated : state.selectedApplication,
      }));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      set({ error: error.response?.data?.detail || 'Failed to withdraw application' });
    }
  },

  setFilter: (status: ApplicationStatus | null) => {
    set({ filter: status });
    get().fetchApplications(status ?? undefined);
  },

  clearSelected: () => set({ selectedApplication: null }),
}));

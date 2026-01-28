import { create } from 'zustand';
import type { ScrapingJob, PostFilters } from '@/types';

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Jobs
  jobs: ScrapingJob[];
  setJobs: (jobs: ScrapingJob[]) => void;
  addJob: (job: ScrapingJob) => void;
  updateJob: (jobId: string, updates: Partial<ScrapingJob>) => void;

  // Filters
  postFilters: PostFilters;
  setPostFilters: (filters: PostFilters) => void;
  clearFilters: () => void;

  // View Mode
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;

  // Selected Post
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;

  // Settings
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  proxies: string[];
  setProxies: (proxies: string[]) => void;
  aiProvider: 'openai' | 'huggingface' | 'local';
  setAiProvider: (provider: 'openai' | 'huggingface' | 'local') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Jobs
  jobs: [],
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...updates } : job
      ),
    })),

  // Filters
  postFilters: {},
  setPostFilters: (filters) => set({ postFilters: filters }),
  clearFilters: () => set({ postFilters: {} }),

  // View Mode
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Selected Post
  selectedPostId: null,
  setSelectedPostId: (id) => set({ selectedPostId: id }),

  // Settings
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
  proxies: [],
  setProxies: (proxies) => set({ proxies }),
  aiProvider: 'openai',
  setAiProvider: (provider) => set({ aiProvider: provider }),
}));

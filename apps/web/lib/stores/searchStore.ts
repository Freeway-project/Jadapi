import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchQuery {
  id: string;
  fromAddress: string;
  toAddress: string;
  fromCoords: { lat: number; lng: number };
  toCoords: { lat: number; lng: number };
  packageType: 'envelope' | 'small' | 'medium' | 'large';
  packageDescription?: string;
  estimatedFare?: number;
  timestamp: number;
}

interface SearchStore {
  recentSearches: SearchQuery[];
  currentSearch: SearchQuery | null;
  addSearch: (search: Omit<SearchQuery, 'id' | 'timestamp'>) => void;
  setCurrentSearch: (search: SearchQuery | null) => void;
  getLastSearch: () => SearchQuery | null;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      currentSearch: null,

      addSearch: (search) => {
        const newSearch: SearchQuery = {
          ...search,
          id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set((state) => ({
          recentSearches: [newSearch, ...state.recentSearches.slice(0, 4)], // Keep last 5
          currentSearch: newSearch,
        }));
      },

      setCurrentSearch: (search) => set({ currentSearch: search }),

      getLastSearch: () => {
        const { recentSearches } = get();
        return recentSearches[0] || null;
      },

      clearRecentSearches: () => set({ recentSearches: [], currentSearch: null }),
    }),
    {
      name: 'jadapi-search-storage',
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);

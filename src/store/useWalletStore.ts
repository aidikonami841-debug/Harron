import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppMode = 'pribadi' | 'bisnis';

interface WalletState {
  activeMode: AppMode | null;
  hasHydrated: boolean;
  setActiveMode: (mode: AppMode) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      activeMode: null,
      hasHydrated: false,
      setActiveMode: (mode) => set({ activeMode: mode }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'financeapp-preferred-mode',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: (initialState) => (state) => (state ?? initialState).setHasHydrated(true),
    },
  ),
);

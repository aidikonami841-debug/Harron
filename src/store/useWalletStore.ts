import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppMode = 'pribadi' | 'bisnis';
export type FontScale = 0.9 | 1 | 1.15 | 1.3;

interface WalletState {
  activeMode: AppMode | null;
  hasHydrated: boolean;
  fontScale: FontScale;
  setActiveMode: (mode: AppMode | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setFontScale: (scale: FontScale) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      activeMode: null,
      hasHydrated: false,
      fontScale: 1.15,
      setActiveMode: (mode) => set({ activeMode: mode }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setFontScale: (scale) => set({ fontScale: scale }),
    }),
    {
      name: 'financeapp-preferred-mode',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: (initialState) => (state) => (state ?? initialState).setHasHydrated(true),
    },
  ),
);

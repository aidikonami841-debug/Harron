import { create } from 'zustand';

export type AppMode = 'pribadi' | 'bisnis';

interface WalletState {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  
  // Data Pribadi
  saldoPribadi: number;
  uangMasukPribadi: number;
  uangKeluarPribadi: number;

  // Data Bisnis
  namaToko: string;
  totalPendapatanBisnis: number;
  omzetBisnis: number;
  pengeluaranBisnis: number;
}

export const useWalletStore = create<WalletState>((set) => ({
  activeMode: 'pribadi',
  setActiveMode: (mode) => set({ activeMode: mode }),

  saldoPribadi: 12450000,
  uangMasukPribadi: 15000000,
  uangKeluarPribadi: 2550000,

  namaToko: 'Toko Kelontong Berkah',
  totalPendapatanBisnis: 45800000,
  omzetBisnis: 60000000,
  pengeluaranBisnis: 14200000,
}));
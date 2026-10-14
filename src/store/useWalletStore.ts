import { create } from 'zustand';

export interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'store';
  balance: number;
}

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string;
  setActiveWallet: (id: string) => void;
  addWallet: (wallet: Wallet) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallets: [
    { id: '1', name: 'Dompet Pribadi', type: 'personal', balance: 1500000 },
    { id: '2', name: 'Kas Toko Utama', type: 'store', balance: 5000000 },
  ],
  activeWalletId: '1',
  setActiveWallet: (id) => set({ activeWalletId: id }),
  addWallet: (wallet) => set((state) => ({ wallets: [...state.wallets, wallet] })),
}));

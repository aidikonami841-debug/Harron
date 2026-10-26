import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppMode } from './useWalletStore';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  mode: AppMode;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
}

interface TransactionState {
  transactions: Transaction[];
  hasHydrated: boolean;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),
      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((item) => item.id === id ? { ...item, ...transaction } : item),
        })),
      removeTransaction: (id) =>
        set((state) => ({ transactions: state.transactions.filter((item) => item.id !== id) })),
    }),
    {
      name: 'financeapp-transactions',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: (initialState) => (state) => (state ?? initialState).setHasHydrated(true),
    },
  ),
);

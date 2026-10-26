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
  addTransaction: (transaction: Transaction) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),
    }),
    {
      name: 'financeapp-transactions',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);

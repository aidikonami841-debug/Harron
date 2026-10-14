import { create } from 'zustand';

export interface Transaction {
  id: string;
  walletId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [
    {
      id: '1',
      walletId: '2',
      type: 'income',
      amount: 250000,
      category: 'Penjualan Toko',
      note: 'Terjual 5 pcs produk',
      date: '2026-06-07',
    },
  ],
  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),
}));

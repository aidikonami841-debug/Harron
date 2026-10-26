import React, { useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionRow, sumTransactions } from '../home/HomeScreen';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { formatRupiah } from '../../utils/currency';

type TypeFilter = 'all' | 'income' | 'expense';
type DateFilter = 'all' | 'month';

const GREEN = '#356B4B';
const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';
const LINE = '#E5E7DF';

export const TransactionsScreen = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const activeMode = useWalletStore((state) => state.activeMode) ?? 'pribadi';
  const transactions = useTransactionStore((state) => state.transactions);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filtered = useMemo(() => transactions.filter((transaction) => {
    if (transaction.mode !== activeMode) return false;
    if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
    if (dateFilter === 'month') {
      const date = new Date(`${transaction.date}T00:00:00`);
      if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) return false;
    }
    return true;
  }), [transactions, activeMode, typeFilter, dateFilter, currentMonth, currentYear]);

  const income = sumTransactions(filtered, 'income');
  const expenses = sumTransactions(filtered, 'expense');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>RIWAYAT KEUANGAN</Text>
        <Text style={styles.heading}>{activeMode === 'bisnis' ? 'Catatan warung' : 'Catatan pribadi'}</Text>

        <View style={styles.segment}>
          <FilterButton label="Semua" active={typeFilter === 'all'} onPress={() => setTypeFilter('all')} />
          <FilterButton label="Pemasukan" active={typeFilter === 'income'} onPress={() => setTypeFilter('income')} />
          <FilterButton label="Pengeluaran" active={typeFilter === 'expense'} onPress={() => setTypeFilter('expense')} />
        </View>

        <View style={styles.filterLine}>
          <Text style={styles.sectionTitle}>Transaksi</Text>
          <View style={styles.dateFilters}>
            <DateChip label="Semua waktu" active={dateFilter === 'all'} onPress={() => setDateFilter('all')} />
            <DateChip label="Bulan ini" active={dateFilter === 'month'} onPress={() => setDateFilter('month')} />
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>MASUK</Text>
            <Text style={styles.income}>{formatRupiah(income)}</Text>
          </View>
          <View style={styles.summaryColumn}>
            <Text style={styles.summaryLabel}>KELUAR</Text>
            <Text style={styles.expense}>{formatRupiah(expenses)}</Text>
          </View>
        </View>

        <View style={styles.ledger}>
          {filtered.length ? filtered.map((transaction, index) => (
            <TransactionRow key={transaction.id} transaction={transaction} last={index === filtered.length - 1} />
          )) : (
            <Text style={styles.empty}>Belum ada transaksi untuk filter ini.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FilterButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.filterButton, active && styles.filterActive]}>
    <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const DateChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.dateChip, active && styles.dateChipActive]}>
    <Text style={[styles.dateText, active && styles.dateTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAPER },
  page: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  eyebrow: { color: MUTED, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  heading: { color: INK, fontSize: 25, fontWeight: '700', marginTop: 5, marginBottom: 20 },
  segment: { flexDirection: 'row', backgroundColor: '#EDEEE8', padding: 4, borderRadius: 9, marginBottom: 12 },
  filterButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 40, paddingHorizontal: 5, borderRadius: 7 },
  filterActive: { backgroundColor: '#FFFFFF' },
  filterText: { color: MUTED, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  filterTextActive: { color: INK },
  filterLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 12, flexWrap: 'wrap', rowGap: 8 },
  sectionTitle: { color: INK, fontSize: 17, fontWeight: '700' },
  dateFilters: { flexDirection: 'row', gap: 6 },
  dateChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: '#EDEEE8' },
  dateChipActive: { backgroundColor: '#DDE8DD' },
  dateText: { color: MUTED, fontSize: 11, fontWeight: '600' },
  dateTextActive: { color: GREEN },
  summary: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, borderRadius: 12, padding: 16, marginBottom: 12 },
  summaryColumn: { flex: 1 },
  summaryLabel: { color: MUTED, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginBottom: 6 },
  income: { color: GREEN, fontSize: 14, fontWeight: '700' },
  expense: { color: INK, fontSize: 14, fontWeight: '700' },
  ledger: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: LINE, paddingHorizontal: 14 },
  empty: { color: MUTED, fontSize: 13, paddingVertical: 20, textAlign: 'center' },
});

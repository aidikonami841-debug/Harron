import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate, TransactionRow, sumTransactions } from '../home/HomeScreen';
import { Transaction, useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { ScaledText as Text } from '../../components/ScaledText';
import { formatRupiah } from '../../utils/currency';
import type { MainTabParamList } from '../../navigation/MainTabs';

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
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [pendingUndo, setPendingUndo] = useState<Transaction | null>(null);
  const undoTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const activeMode = useWalletStore((state) => state.activeMode) ?? 'pribadi';
  const transactions = useTransactionStore((state) => state.transactions);
  const removeTransaction = useTransactionStore((state) => state.removeTransaction);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filtered = useMemo(() => transactions
    .filter((transaction) => {
      if (transaction.mode !== activeMode) return false;
      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
      if (dateFilter === 'month') {
        const date = new Date(`${transaction.date}T00:00:00`);
        if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) return false;
      }
      return true;
    })
    .sort((first, second) => second.date.localeCompare(first.date) || second.id.localeCompare(first.id)),
  [transactions, activeMode, typeFilter, dateFilter, currentMonth, currentYear]);

  useEffect(() => () => {
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
  }, []);

  const income = sumTransactions(filtered, 'income');
  const expenses = sumTransactions(filtered, 'expense');

  const requestDelete = (transaction: Transaction) => {
    Alert.alert('Hapus transaksi?', `${transaction.category} · ${formatRupiah(transaction.amount)}`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          if (undoTimeout.current) clearTimeout(undoTimeout.current);
          removeTransaction(transaction.id);
          setPendingUndo(transaction);
          setSelected(null);
          undoTimeout.current = setTimeout(() => setPendingUndo(null), 6000);
        },
      },
    ]);
  };

  const undoDelete = () => {
    if (!pendingUndo) return;
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    addTransaction(pendingUndo);
    setPendingUndo(null);
  };

  const editSelected = () => {
    if (!selected) return;
    const transactionId = selected.id;
    setSelected(null);
    navigation.navigate('Tambah', { transactionId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>RIWAYAT KEUANGAN</Text>
        <Text style={styles.heading}>{activeMode === 'bisnis' ? 'Catatan warung' : 'Catatan pribadi'}</Text>

        {pendingUndo ? (
          <View style={styles.undoBanner}>
            <Text style={styles.undoText}>Transaksi dihapus</Text>
            <TouchableOpacity accessibilityRole="button" onPress={undoDelete} hitSlop={8}>
              <Text style={styles.undoAction}>URUNGKAN</Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              last={index === filtered.length - 1}
              onPress={() => setSelected(transaction)}
            />
          )) : (
            <Text style={styles.empty}>Belum ada transaksi untuk filter ini.</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        {selected ? (
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detail transaksi</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => setSelected(null)} hitSlop={10}>
                  <Ionicons name="close" size={24} color={MUTED} />
                </TouchableOpacity>
              </View>
              <View style={[styles.modalMark, selected.type === 'income' ? styles.incomeMark : styles.expenseMark]}>
                <Ionicons name={selected.type === 'income' ? 'arrow-down-outline' : 'arrow-up-outline'} size={23} color={selected.type === 'income' ? GREEN : '#B2764B'} />
              </View>
              <Text style={styles.detailCategory}>{selected.category}</Text>
              <Text style={[styles.detailAmount, selected.type === 'income' ? styles.income : styles.expense]}>
                {selected.type === 'income' ? '+' : '−'}{formatRupiah(selected.amount)}
              </Text>
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Tanggal</Text>
                <Text style={styles.detailValue}>{formatDate(selected.date)}</Text>
              </View>
              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Catatan</Text>
                <Text style={styles.detailValue}>{selected.note || '—'}</Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.editButton} onPress={editSelected} activeOpacity={0.8}>
                  <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.actionText}>Edit transaksi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => requestDelete(selected)} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#A84D3A" />
                  <Text style={styles.deleteText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </Modal>
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
  undoBanner: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#26362B', borderRadius: 10, paddingHorizontal: 14, marginBottom: 12 },
  undoText: { color: '#FFFFFF', fontSize: 13 },
  undoAction: { color: '#D5E7D4', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
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
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(21, 29, 23, 0.46)' },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 21 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: INK, fontSize: 16, fontWeight: '700' },
  modalMark: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  incomeMark: { backgroundColor: '#E9F1E7' },
  expenseMark: { backgroundColor: '#F5ECE5' },
  detailCategory: { color: INK, fontSize: 18, fontWeight: '700', marginTop: 12 },
  detailAmount: { fontSize: 25, fontWeight: '700', marginTop: 4, marginBottom: 16 },
  detailLine: { minHeight: 42, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: LINE },
  detailLabel: { color: MUTED, fontSize: 12 },
  detailValue: { color: INK, fontSize: 12, fontWeight: '600', maxWidth: '65%', textAlign: 'right' },
  modalActions: { flexDirection: 'row', gap: 9, marginTop: 18 },
  editButton: { flex: 1, minHeight: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, backgroundColor: GREEN, borderRadius: 9 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  deleteButton: { minWidth: 94, minHeight: 48, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#F8EFEC', borderRadius: 9 },
  deleteText: { color: '#A84D3A', fontSize: 12, fontWeight: '700' },
});

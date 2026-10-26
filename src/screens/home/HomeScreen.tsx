import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWalletStore } from '../../store/useWalletStore';
import { Transaction, useTransactionStore } from '../../store/useTransactionStore';
import { formatRupiah } from '../../utils/currency';
import type { MainTabParamList } from '../../navigation/MainTabs';

const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';
const LINE = '#E5E7DF';
const GREEN = '#356B4B';

export const HomeScreen = () => {
  const activeMode = useWalletStore((state) => state.activeMode);
  const transactions = useTransactionStore((state) => state.transactions);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const mode = activeMode ?? 'pribadi';
  const isBusiness = mode === 'bisnis';
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(24, Math.max(16, width * 0.055));
  const modeTransactions = transactions.filter((transaction) => transaction.mode === mode);
  const now = new Date();
  const monthTransactions = modeTransactions.filter((transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const incomeThisMonth = sumTransactions(monthTransactions, 'income');
  const expensesThisMonth = sumTransactions(monthTransactions, 'expense');
  const balance = sumTransactions(modeTransactions, 'income') - sumTransactions(modeTransactions, 'expense');
  const recentTransactions = modeTransactions.slice(0, 3);
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <ScrollView
        contentContainerStyle={[styles.page, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topline}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>CATATAN KEUANGAN</Text>
            <Text style={styles.heading}>{isBusiness ? 'Warung saya' : 'Keuangan saya'}</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>{isBusiness ? 'W' : 'S'}</Text></View>
        </View>

        <View style={styles.modeBadge}>
          <Ionicons name={isBusiness ? 'storefront-outline' : 'person-outline'} size={14} color={GREEN} />
          <Text style={styles.modeBadgeText}>{isBusiness ? 'Mode Warung' : 'Mode Pribadi'}</Text>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>{isBusiness ? 'SISA KAS' : 'SALDO SAAT INI'}</Text>
          <Text style={styles.balance}>{formatRupiah(balance)}</Text>
          <Text style={styles.period}>Ringkasan · {monthLabel}</Text>
          <View style={styles.rule} />
          <View style={styles.totals}>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>{isBusiness ? 'Penjualan bulan ini' : 'Pemasukan bulan ini'}</Text>
              <Text style={styles.incomeValue}>{formatRupiah(incomeThisMonth)}</Text>
            </View>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Pengeluaran bulan ini</Text>
              <Text style={styles.totalValue}>{formatRupiah(expensesThisMonth)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          style={styles.addButton}
          onPress={() => navigation.navigate('Tambah')}
        >
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.addText}>Catat transaksi</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catatan terbaru</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Catatan')}>
            <Text style={styles.seeAll}>Lihat semua</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ledger}>
          {recentTransactions.length ? recentTransactions.map((transaction, index) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              last={index === recentTransactions.length - 1}
            />
          )) : (
            <Text style={styles.emptyText}>Belum ada catatan. Mulai catat transaksi pertamamu.</Text>
          )}
        </View>

        <Text style={styles.footer}>Rapi mencatat, tenang mengatur.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export const TransactionRow = ({ transaction, last = false }: { transaction: Transaction; last?: boolean }) => {
  const isIncome = transaction.type === 'income';
  return (
    <View style={[styles.row, last && styles.lastRow]}>
      <View style={[styles.mark, isIncome ? styles.inMark : styles.outMark]} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle} numberOfLines={1}>{transaction.category}</Text>
        <Text style={styles.rowDetail} numberOfLines={1}>
          {transaction.note ? `${transaction.note} · ` : ''}{formatDate(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.incomeValue : styles.amountOut]} numberOfLines={1}>
        {isIncome ? '+' : '−'}{formatRupiah(transaction.amount)}
      </Text>
    </View>
  );
};

export const sumTransactions = (transactions: Transaction[], type: Transaction['type']) =>
  transactions.reduce((total, transaction) => total + (transaction.type === type ? transaction.amount : 0), 0);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${date}T00:00:00`),
  );

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAPER },
  page: { paddingTop: 14, paddingBottom: 28 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 23 },
  headingCopy: { flex: 1, minWidth: 0, paddingRight: 12 },
  eyebrow: { color: MUTED, fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  heading: { color: INK, fontSize: 23, fontWeight: '700', marginTop: 5, flexShrink: 1 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E5E9DF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: GREEN, fontSize: 15, fontWeight: '700' },
  modeBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, backgroundColor: '#E9EEE6', marginBottom: 16 },
  modeBadgeText: { color: GREEN, fontSize: 11, fontWeight: '600' },
  summary: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: LINE, padding: 19 },
  summaryLabel: { color: MUTED, fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  balance: { color: INK, fontSize: 29, fontWeight: '700', marginTop: 7 },
  period: { color: MUTED, fontSize: 12, marginTop: 5 },
  rule: { height: 1, backgroundColor: LINE, marginVertical: 17 },
  totals: { flexDirection: 'row' },
  totalBlock: { flex: 1, paddingRight: 8 },
  totalLabel: { color: MUTED, fontSize: 12, marginBottom: 6 },
  incomeValue: { color: GREEN, fontWeight: '600', fontSize: 14 },
  totalValue: { color: INK, fontWeight: '600', fontSize: 14 },
  addButton: { backgroundColor: GREEN, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 9, marginTop: 14 },
  plus: { color: '#FFFFFF', fontSize: 19, lineHeight: 20, marginRight: 7 },
  addText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 29, marginBottom: 11 },
  sectionTitle: { color: INK, fontSize: 17, fontWeight: '700' },
  seeAll: { color: GREEN, fontSize: 12, fontWeight: '600' },
  ledger: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: LINE, paddingHorizontal: 14 },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: LINE },
  lastRow: { borderBottomWidth: 0 },
  mark: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  inMark: { backgroundColor: GREEN },
  outMark: { backgroundColor: '#C88755' },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: INK, fontSize: 13, fontWeight: '600' },
  rowDetail: { color: MUTED, fontSize: 11, marginTop: 4 },
  amount: { fontSize: 12, fontWeight: '600', marginLeft: 8 },
  amountOut: { color: INK },
  emptyText: { color: MUTED, fontSize: 13, lineHeight: 20, paddingVertical: 19 },
  footer: { color: '#9A9F97', fontSize: 11, textAlign: 'center', marginTop: 24 },
});

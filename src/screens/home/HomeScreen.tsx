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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppMode, useWalletStore } from '../../store/useWalletStore';
import { formatRupiah } from '../../utils/currency';

const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';
const LINE = '#E5E7DF';
const GREEN = '#356B4B';

export const HomeScreen = () => {
  const {
    activeMode,
    setActiveMode,
    saldoPribadi,
    uangMasukPribadi,
    uangKeluarPribadi,
    namaToko,
    totalPendapatanBisnis,
    omzetBisnis,
    pengeluaranBisnis,
  } = useWalletStore();
  const isBusiness = activeMode === 'bisnis';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPadding = Math.min(24, Math.max(16, width * 0.055));

  const rows = isBusiness
    ? [
        { title: 'Penjualan hari ini', detail: 'Tunai · 10:42', amount: 1250000, kind: 'in' },
        { title: 'Belanja stok beras', detail: 'Kulakan · 09:15', amount: -680000, kind: 'out' },
        { title: 'Listrik toko', detail: 'Operasional · Kemarin', amount: -215000, kind: 'out' },
      ]
    : [
        { title: 'Gaji bulanan', detail: 'Pekerjaan · 25 Okt', amount: 8500000, kind: 'in' },
        { title: 'Belanja dapur', detail: 'Rumah tangga · 24 Okt', amount: -325000, kind: 'out' },
        { title: 'Transportasi', detail: 'Perjalanan · 23 Okt', amount: -85000, kind: 'out' },
      ];

  const chooseMode = (mode: AppMode) => setActiveMode(mode);

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
            <Text style={styles.heading}>{isBusiness ? namaToko : 'Keuangan saya'}</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>{isBusiness ? 'W' : 'S'}</Text></View>
        </View>

        <View style={styles.switcher}>
          <ModeButton label="Pribadi" selected={!isBusiness} onPress={() => chooseMode('pribadi')} />
          <ModeButton label="Warung" selected={isBusiness} onPress={() => chooseMode('bisnis')} />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>{isBusiness ? 'SISA KAS' : 'SALDO SAAT INI'}</Text>
          <Text style={styles.balance}>{formatRupiah(isBusiness ? totalPendapatanBisnis : saldoPribadi)}</Text>
          <Text style={styles.period}>Ringkasan · Oktober 2026</Text>
          <View style={styles.rule} />
          <View style={styles.totals}>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>{isBusiness ? 'Penjualan' : 'Pemasukan'}</Text>
              <Text style={styles.incomeValue}>{formatRupiah(isBusiness ? omzetBisnis : uangMasukPribadi)}</Text>
            </View>
            <View style={styles.totalBlock}>
              <Text style={styles.totalLabel}>Pengeluaran</Text>
              <Text style={styles.totalValue}>{formatRupiah(isBusiness ? pengeluaranBisnis : uangKeluarPribadi)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} style={styles.addButton}>
          <Text style={styles.plus}>＋</Text>
          <Text style={styles.addText}>Catat transaksi</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catatan terbaru</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Lihat semua</Text></TouchableOpacity>
        </View>
        <View style={styles.ledger}>
          {rows.map((row, index) => (
            <View key={row.title} style={[styles.row, index === rows.length - 1 && styles.lastRow]}>
              <View style={[styles.mark, row.kind === 'in' ? styles.inMark : styles.outMark]} />
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowDetail}>{row.detail}</Text>
              </View>
              <Text style={[styles.amount, row.kind === 'in' ? styles.incomeValue : styles.amountOut]}>
                {row.kind === 'in' ? '+' : '−'}{formatRupiah(Math.abs(row.amount))}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Rapi mencatat, tenang mengatur.</Text>
      </ScrollView>
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <NavItem label="Ringkasan" active />
        <NavItem label="Catatan" />
        <NavItem label="Laporan" />
        <NavItem label="Profil" />
      </View>
    </SafeAreaView>
  );
};

const ModeButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.modeButton, selected && styles.modeSelected]}>
    <Text style={[styles.modeText, selected && styles.modeTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const NavItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    style={styles.navButton}
    activeOpacity={0.7}
  >
    <Text style={active ? styles.navActive : styles.navItem}>{label}</Text>
  </TouchableOpacity>
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
  switcher: { flexDirection: 'row', backgroundColor: '#EDEEE8', padding: 4, borderRadius: 9, marginBottom: 20 },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 7 },
  modeSelected: { backgroundColor: '#FFFFFF' },
  modeText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  modeTextSelected: { color: INK },
  summary: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: LINE, padding: 19 },
  summaryLabel: { color: MUTED, fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  balance: { color: INK, fontSize: 29, fontWeight: '700', marginTop: 7 },
  period: { color: MUTED, fontSize: 12, marginTop: 5 },
  rule: { height: 1, backgroundColor: LINE, marginVertical: 17 },
  totals: { flexDirection: 'row' },
  totalBlock: { flex: 1 },
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
  rowCopy: { flex: 1 },
  rowTitle: { color: INK, fontSize: 13, fontWeight: '600' },
  rowDetail: { color: MUTED, fontSize: 11, marginTop: 4 },
  amount: { fontSize: 12, fontWeight: '600' },
  amountOut: { color: INK },
  footer: { color: '#9A9F97', fontSize: 11, textAlign: 'center', marginTop: 24 },
  bottomBar: { minHeight: 64, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: LINE, flexDirection: 'row', alignItems: 'center', paddingTop: 6 },
  navButton: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  navActive: { color: GREEN, fontSize: 13, fontWeight: '700' },
  navItem: { color: MUTED, fontSize: 13, fontWeight: '500' },
});

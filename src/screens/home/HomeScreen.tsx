import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useWalletStore, AppMode } from '../../store/useWalletStore';
import { formatCurrency } from '../../utils/currency';

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

  const isBisnis = activeMode === 'bisnis';

  // Dummy data transaksi sesuai gambar
  const transaksiPribadi = [
    { id: '1', title: 'Gaji Bulanan', date: '15 July, 2024', amount: 15000000, type: 'in', icon: 'wallet-outline' },
    { id: '2', title: 'Belanja Bulanan', date: '1 July, 2024', amount: -1200000, type: 'out', icon: 'cart-outline' },
    { id: '3', title: 'Kopi & Snacking', date: '2 July, 2024', amount: -350000, type: 'out', icon: 'cafe-outline' },
  ];

  const transaksiBisnis = [
    { id: '1', title: 'Penjualan Grosir', date: '3 July, 2024', amount: 1500000, type: 'in', icon: 'cart-outline' },
    { id: '2', title: 'Beli Stok Sembako', date: '1 July, 2024', amount: -5000000, type: 'out', icon: 'basket-outline' },
    { id: '3', title: 'Listrik & Air Toko', date: '1 July, 2024', amount: -450000, type: 'out', icon: 'flash-outline' },
  ];

  const transactions = isBisnis ? transaksiBisnis : transaksiPribadi;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isBisnis ? COLORS.bisnis.headerBg : COLORS.background }]}>
      <StatusBar barStyle={isBisnis ? 'light-content' : 'dark-content'} />
      
      {/* HEADER & TOGGLE MODE */}
      <View style={[styles.headerContainer, { backgroundColor: isBisnis ? COLORS.bisnis.headerBg : COLORS.white }]}>
        <View style={styles.topHeader}>
          <Text style={[styles.greetingText, { color: isBisnis ? COLORS.white : COLORS.textPrimary }]}>
            {isBisnis ? 'Toko App' : 'Hai, Kak'}
          </Text>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={isBisnis ? COLORS.white : COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Mode Switcher Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isBisnis && styles.toggleActivePribadi]}
            onPress={() => setActiveMode('pribadi')}
          >
            <Text style={[styles.toggleText, !isBisnis ? styles.toggleTextActiveWhite : styles.toggleTextInactive]}>
              Keuangan Pribadi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, isBisnis && styles.toggleActiveBisnis]}
            onPress={() => setActiveMode('bisnis')}
          >
            <Text style={[styles.toggleText, isBisnis ? styles.toggleTextActiveBlack : styles.toggleTextInactive]}>
              Keuangan Bisnis
            </Text>
          </TouchableOpacity>
        </View>

        {isBisnis && (
          <Text style={styles.namaTokoText}>{namaToko}</Text>
        )}
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* CARD RINGKASAN SALDO / PENDAPATAN */}
        <View style={styles.cardSummary}>
          <Text style={styles.cardTitle}>
            {isBisnis ? 'Total Pendapatan Bisnis' : 'Total Saldo Dompet Kita'}
          </Text>
          <Text style={styles.cardMainValue}>
            {formatCurrency(isBisnis ? totalPendapatanBisnis : saldoPribadi)}
          </Text>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <View style={styles.cardCol}>
              <Text style={styles.cardSubTitle}>{isBisnis ? 'Omzet' : 'Uang Masuk'}</Text>
              <Text style={[styles.cardSubValue, { color: COLORS.textPrimary }]}>
                {formatCurrency(isBisnis ? omzetBisnis : uangMasukPribadi)}
              </Text>
            </View>
            <View style={styles.cardCol}>
              <Text style={styles.cardSubTitle}>{isBisnis ? 'Pengeluaran' : 'Uang Keluar'}</Text>
              <Text style={[styles.cardSubValue, { color: COLORS.textPrimary }]}>
                {formatCurrency(isBisnis ? pengeluaranBisnis : uangKeluarPribadi)}
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTION BUTTONS */}
        <View style={styles.quickActionGrid}>
          {!isBisnis ? (
            <>
              <QuickBtn icon="arrow-up-outline" label="Catat Masuk" bg={COLORS.pastelBlue} color="#0284C7" />
              <QuickBtn icon="arrow-down-outline" label="Catat Keluar" bg={COLORS.pastelRed} color="#E11D48" />
              <QuickBtn icon="swap-horizontal-outline" label="Transfer" bg={COLORS.pastelCyan} color="#0891B2" />
              <QuickBtn icon="pie-chart-outline" label="Analisis" bg={COLORS.pastelPurple} color="#9333EA" />
            </>
          ) : (
            <>
              <QuickBtn icon="storefront-outline" label="Catat Penjualan" bg={COLORS.pastelGreen} color="#059669" />
              <QuickBtn icon="basket-outline" label="Kulakan/Stok" bg={COLORS.pastelOrange} color="#D97706" />
              <QuickBtn icon="receipt-outline" label="Utang Piutang" bg={COLORS.pastelRose} color="#E11D48" />
              <QuickBtn icon="bar-chart-outline" label="Laporan" bg={COLORS.pastelTeal} color="#0D9488" />
            </>
          )}
        </View>

        {/* TRANSAKSI TERAKHIR */}
        <View style={styles.transactionSection}>
          <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>

          {transactions.map((item) => (
            <View key={item.id} style={styles.transItem}>
              <View style={styles.transLeft}>
                <View style={styles.transIconBg}>
                  <Ionicons name={item.icon as any} size={20} color={isBisnis ? COLORS.bisnis.primary : COLORS.pribadi.primary} />
                </View>
                <View>
                  <Text style={styles.transTitle}>{item.title}</Text>
                  <Text style={styles.transDate}>{item.date}</Text>
                </View>
              </View>
              <Text style={[styles.transAmount, { color: item.amount > 0 ? COLORS.income : COLORS.textPrimary }]}>
                {item.amount > 0 ? `+${formatCurrency(item.amount)}` : `-${formatCurrency(Math.abs(item.amount))}`}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Beranda" active />
        <NavItem icon="swap-horizontal" label="Transaksi" />
        <NavItem icon="stats-chart" label="Laporan" />
        <NavItem icon="settings-outline" label="Pengaturan" />
      </View>
    </SafeAreaView>
  );
};

// Helper Components
const QuickBtn = ({ icon, label, bg, color }: { icon: string; label: string; bg: string; color: string }) => (
  <TouchableOpacity style={styles.quickItem}>
    <View style={[styles.quickIconBg, { backgroundColor: bg }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const NavItem = ({ icon, label, active }: { icon: string; label: string; active?: boolean }) => (
  <TouchableOpacity style={styles.navItem}>
    <Ionicons name={icon as any} size={22} color={active ? COLORS.pribadi.primary : COLORS.textMuted} />
    <Text style={[styles.navLabel, { color: active ? COLORS.pribadi.primary : COLORS.textMuted }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingText: { fontSize: 22, fontWeight: 'bold' },
  notificationBtn: { padding: 4 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    padding: 4,
    marginTop: 15,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  toggleActivePribadi: { backgroundColor: '#2563EB' },
  toggleActiveBisnis: { backgroundColor: '#FFFFFF' },
  toggleText: { fontSize: 13, fontWeight: '600' },
  toggleTextActiveWhite: { color: '#FFFFFF' },
  toggleTextActiveBlack: { color: '#111827' },
  toggleTextInactive: { color: '#4B5563' },
  namaTokoText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  scrollBody: { flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 20 },
  cardSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  cardMainValue: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  cardDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardCol: { flex: 1 },
  cardSubTitle: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  cardSubValue: { fontSize: 15, fontWeight: 'bold' },
  quickActionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  quickItem: { alignItems: 'center', width: '22%' },
  quickIconBg: { width: 54, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 11, textAlign: 'center', color: '#374151', fontWeight: '500' },
  transactionSection: { marginTop: 25, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  transItem: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  transLeft: { flexDirection: 'row', alignItems: 'center' },
  transIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  transDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  transAmount: { fontSize: 14, fontWeight: 'bold' },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navLabel: { fontSize: 10, marginTop: 3 },
});
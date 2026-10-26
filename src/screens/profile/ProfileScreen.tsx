import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWalletStore } from '../../store/useWalletStore';

const GREEN = '#356B4B';
const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';
const LINE = '#E5E7DF';

export const ProfileScreen = () => {
  const activeMode = useWalletStore((state) => state.activeMode) ?? 'pribadi';
  const setActiveMode = useWalletStore((state) => state.setActiveMode);
  const business = activeMode === 'bisnis';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <View style={styles.page}>
        <Text style={styles.eyebrow}>PENGATURAN</Text>
        <Text style={styles.heading}>Profil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Ionicons name={business ? 'storefront-outline' : 'person-outline'} size={26} color={GREEN} /></View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{business ? 'Mode Warung' : 'Mode Pribadi'}</Text>
            <Text style={styles.profileDescription}>Catatan transaksi dipisahkan untuk tiap mode.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ganti mode keuangan</Text>
        <ModeOption
          title="Keuangan pribadi"
          description="Pemasukan dan pengeluaran sehari-hari"
          icon="person-outline"
          selected={activeMode === 'pribadi'}
          onPress={() => setActiveMode('pribadi')}
        />
        <ModeOption
          title="Keuangan warung"
          description="Penjualan dan biaya operasional usaha"
          icon="storefront-outline"
          selected={business}
          onPress={() => setActiveMode('bisnis')}
        />

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={19} color={GREEN} />
          <Text style={styles.noteText}>Saat mode diganti, Beranda dan Catatan akan menampilkan data mode tersebut. Data mode lainnya tetap tersimpan.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const ModeOption = ({
  title,
  description,
  icon,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  icon: 'person-outline' | 'storefront-outline';
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    accessibilityRole="radio"
    accessibilityState={{ selected }}
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.option, selected && styles.optionSelected]}
  >
    <View style={styles.optionIcon}><Ionicons name={icon} size={21} color={GREEN} /></View>
    <View style={styles.optionCopy}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    {selected ? <Ionicons name="checkmark-circle" size={22} color={GREEN} /> : <View style={styles.unselected} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAPER },
  page: { flex: 1, paddingHorizontal: 20, paddingTop: 18 },
  eyebrow: { color: MUTED, fontSize: 10, letterSpacing: 1.3, fontWeight: '700' },
  heading: { color: INK, fontSize: 25, fontWeight: '700', marginTop: 5, marginBottom: 22 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, borderRadius: 13, padding: 16, marginBottom: 28 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E5E9DF', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  profileText: { flex: 1 },
  profileName: { color: INK, fontSize: 15, fontWeight: '700' },
  profileDescription: { color: MUTED, fontSize: 12, lineHeight: 18, marginTop: 4 },
  sectionTitle: { color: INK, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 76, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, borderRadius: 12, paddingHorizontal: 13, marginBottom: 10 },
  optionSelected: { borderColor: GREEN, backgroundColor: '#F2F6F0' },
  optionIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#E9EEE6', marginRight: 12 },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: INK, fontSize: 14, fontWeight: '700' },
  optionDescription: { color: MUTED, fontSize: 11, marginTop: 4 },
  unselected: { width: 21, height: 21, borderWidth: 1.5, borderColor: '#C9CEC6', borderRadius: 11, marginLeft: 8 },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 12, padding: 13, borderRadius: 10, backgroundColor: '#E9EEE6' },
  noteText: { flex: 1, color: '#59665C', fontSize: 12, lineHeight: 18 },
});

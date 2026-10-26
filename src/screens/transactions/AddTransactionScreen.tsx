import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppMode, useWalletStore } from '../../store/useWalletStore';
import { TransactionType, useTransactionStore } from '../../store/useTransactionStore';
import { formatRupiah } from '../../utils/currency';
import type { MainTabParamList } from '../../navigation/MainTabs';

const GREEN = '#356B4B';
const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';
const LINE = '#E5E7DF';
const CATEGORIES: Record<AppMode, Record<TransactionType, string[]>> = {
  pribadi: {
    income: ['Gaji', 'Usaha', 'Bonus', 'Hadiah', 'Lainnya'],
    expense: ['Makan', 'Transportasi', 'Belanja', 'Tagihan', 'Lainnya'],
  },
  bisnis: {
    income: ['Penjualan', 'Jasa', 'Modal', 'Piutang', 'Lainnya'],
    expense: ['Stok barang', 'Operasional', 'Gaji', 'Tagihan', 'Lainnya'],
  },
};

const localDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AddTransactionScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const mode = useWalletStore((state) => state.activeMode) ?? 'pribadi';
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[mode].expense[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(localDateString(new Date()));
  const categories = CATEGORIES[mode][type];
  const selectedCategory = categories.includes(category) ? category : categories[0];

  const chooseType = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(CATEGORIES[mode][nextType][0]);
  };

  const save = () => {
    const numericAmount = Number(amount.replace(/[^0-9]/g, ''));
    const [year, month, day] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
      && !Number.isNaN(parsedDate.getTime())
      && parsedDate.getFullYear() === year
      && parsedDate.getMonth() === month - 1
      && parsedDate.getDate() === day;
    if (!numericAmount || numericAmount < 1) {
      Alert.alert('Nominal belum valid', 'Masukkan nominal transaksi lebih dari nol.');
      return;
    }
    if (!validDate) {
      Alert.alert('Tanggal belum valid', 'Gunakan format tahun-bulan-tanggal, misalnya 2026-10-26.');
      return;
    }

    addTransaction({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      mode,
      type,
      amount: numericAmount,
      category: selectedCategory,
      note: note.trim(),
      date,
    });
    setAmount('');
    setNote('');
    setDate(localDateString(new Date()));
    navigation.navigate('Beranda');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>CATAT UANG MASUK DAN KELUAR</Text>
          <Text style={styles.heading}>Transaksi baru</Text>

          <View style={styles.modeBadge}>
            <Ionicons name={mode === 'bisnis' ? 'storefront-outline' : 'person-outline'} size={16} color={GREEN} />
            <Text style={styles.modeBadgeText}>{mode === 'bisnis' ? 'Keuangan warung' : 'Keuangan pribadi'}</Text>
          </View>

          <View style={styles.segment}>
            <Choice label="Pengeluaran" active={type === 'expense'} onPress={() => chooseType('expense')} />
            <Choice label="Pemasukan" active={type === 'income'} onPress={() => chooseType('income')} />
          </View>

          <Text style={styles.fieldLabel}>Nominal</Text>
          <View style={styles.amountField}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              value={amount}
              onChangeText={(value) => setAmount(value.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#A4AAA3"
              style={styles.amountInput}
              accessibilityLabel="Nominal transaksi dalam rupiah"
            />
          </View>
          {amount ? <Text style={styles.amountPreview}>{formatRupiah(Number(amount))}</Text> : null}

          <Text style={styles.fieldLabel}>Kategori</Text>
          <View style={styles.categoryList}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryChip, selectedCategory === item && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextSelected]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Tanggal</Text>
          <TextInput
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A4AAA3"
            style={styles.textField}
            autoCapitalize="none"
            accessibilityLabel="Tanggal transaksi dengan format tahun-bulan-tanggal"
          />
          <Text style={styles.helper}>Format tahun-bulan-tanggal, contoh 2026-10-26.</Text>

          <Text style={styles.fieldLabel}>Catatan (opsional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Contoh: belanja kebutuhan mingguan"
            placeholderTextColor="#A4AAA3"
            style={[styles.textField, styles.noteField]}
            maxLength={100}
          />

          <TouchableOpacity style={styles.saveButton} onPress={save} activeOpacity={0.8}>
            <Text style={styles.saveText}>Simpan transaksi</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Choice = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.choice, active && styles.choiceActive]}>
    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: PAPER },
  page: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },
  eyebrow: { color: MUTED, fontSize: 10, letterSpacing: 1.3, fontWeight: '700' },
  heading: { color: INK, fontSize: 25, fontWeight: '700', marginTop: 5, marginBottom: 20 },
  modeBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 15, backgroundColor: '#E9EEE6', marginBottom: 12 },
  modeBadgeText: { color: GREEN, fontSize: 12, fontWeight: '600' },
  segment: { flexDirection: 'row', backgroundColor: '#EDEEE8', padding: 4, borderRadius: 9, marginBottom: 12 },
  choice: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 42, borderRadius: 7, paddingHorizontal: 6 },
  choiceActive: { backgroundColor: '#FFFFFF' },
  choiceText: { color: MUTED, fontSize: 13, fontWeight: '600' },
  choiceTextActive: { color: INK },
  fieldLabel: { color: INK, fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  amountField: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: LINE, borderRadius: 10, backgroundColor: '#FFFFFF' },
  currency: { color: MUTED, fontSize: 18, fontWeight: '600', marginRight: 10 },
  amountInput: { flex: 1, color: INK, fontSize: 22, fontWeight: '700', paddingVertical: 8 },
  amountPreview: { color: GREEN, fontSize: 12, marginTop: 6, textAlign: 'right' },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderWidth: 1, borderColor: LINE, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#FFFFFF' },
  categoryChipSelected: { borderColor: GREEN, backgroundColor: '#E5EDE5' },
  categoryText: { color: MUTED, fontSize: 12, fontWeight: '600' },
  categoryTextSelected: { color: GREEN },
  textField: { minHeight: 48, borderWidth: 1, borderColor: LINE, borderRadius: 9, backgroundColor: '#FFFFFF', paddingHorizontal: 13, color: INK, fontSize: 14 },
  helper: { color: MUTED, fontSize: 11, marginTop: 6 },
  noteField: { minHeight: 56 },
  saveButton: { minHeight: 52, backgroundColor: GREEN, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

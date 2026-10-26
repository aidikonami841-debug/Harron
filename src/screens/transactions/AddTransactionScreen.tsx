import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledText as Text, ScaledTextInput as TextInput } from '../../components/ScaledText';
import { AppMode, useWalletStore } from '../../store/useWalletStore';
import { TransactionType, useTransactionStore } from '../../store/useTransactionStore';
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
  const route = useRoute<BottomTabScreenProps<MainTabParamList, 'Tambah'>['route']>();
  const transactionId = route.params?.transactionId;
  const mode = useWalletStore((state) => state.activeMode) ?? 'pribadi';
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const existing = useTransactionStore((state) => state.transactions.find((item) => item.id === transactionId));
  const formMode = transactionId && existing ? existing.mode : mode;
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[formMode].expense[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(localDateString(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const categories = CATEGORIES[formMode][type];
  const selectedCategory = categories.includes(category) ? category : categories[0];

  useEffect(() => {
    if (transactionId && existing) {
      setType(existing.type);
      setAmount(`${existing.amount}`);
      setCategory(existing.category);
      setNote(existing.note);
      setDate(existing.date);
      return;
    }
    if (!transactionId) {
      setType('expense');
      setAmount('');
      setCategory(CATEGORIES[mode].expense[0]);
      setNote('');
      setDate(localDateString(new Date()));
    }
  }, [transactionId, existing, mode]);

  const chooseType = (nextType: TransactionType) => {
    setType(nextType);
    setCategory(CATEGORIES[formMode][nextType][0]);
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

    const values = {
      mode: formMode,
      type,
      amount: numericAmount,
      category: selectedCategory,
      note: note.trim(),
      date,
    };
    if (transactionId && existing) {
      updateTransaction(transactionId, values);
      navigation.setParams({ transactionId: undefined });
    } else {
      addTransaction({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...values,
      });
    }
    setAmount('');
    setNote('');
    setDate(localDateString(new Date()));
    navigation.navigate('Beranda');
  };

  const dateObject = () => {
    const [year, month, day] = date.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) setDate(localDateString(selectedDate));
    if (Platform.OS === 'android') setShowDatePicker(false);
  };

  const scanReceipt = async (source: 'camera' | 'gallery') => {
    try {
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (result.canceled || !result.assets[0]) return;

      const uri = result.assets[0].uri;
      setReceiptUri(uri);
      setScanningReceipt(true);
      try {
        // Loaded on demand so the form still opens in Expo Go, where custom native modules are unavailable.
        const { recognizeText } = require('expo-mlkit-ocr') as {
          recognizeText: (imageUri: string) => Promise<{ text: string }>;
        };
        const { text: recognizedText } = await recognizeText(uri);
        const lines = recognizedText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        const totalIndex = lines.findIndex((line) => /grand\s*total|total|jumlah|tagihan|bayar|amount\s*due/i.test(line));
        const totalContext = totalIndex >= 0 ? `${lines[totalIndex]} ${lines[totalIndex + 1] ?? ''}` : '';
        const amountMatches = totalContext.match(/(?:rp\.?\s*)?\d[\d.,\s]{1,}/gi) ?? [];
        const amountCandidate = amountMatches
          .map((match) => Number(match.replace(/\D/g, '')))
          .filter((value) => value > 0)
          .slice(-1)[0];
        if (amountCandidate) setAmount(String(amountCandidate));

        const dateMatch = recognizedText.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
        if (dateMatch) {
          const day = Number(dateMatch[1]);
          const month = Number(dateMatch[2]);
          let year = Number(dateMatch[3]);
          if (year < 100) year += 2000;
          const parsed = new Date(year, month - 1, day);
          if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) {
            setDate(localDateString(parsed));
          }
        }

        Alert.alert(
          amountCandidate ? 'Struk berhasil dibaca' : 'Struk sudah dipindai',
          amountCandidate
            ? 'Nominal dan tanggal terdeteksi bila tersedia. Cek lagi sebelum menyimpan.'
            : 'Nominal belum terbaca dengan yakin. Isi nominalnya secara manual lalu cek sebelum menyimpan.',
        );
      } catch {
        Alert.alert(
          'Foto struk siap',
          'Pembacaan otomatis membutuhkan development build. Kamu tetap bisa isi nominal dan tanggal secara manual.',
        );
      } finally {
        setScanningReceipt(false);
      }
    } catch {
      setScanningReceipt(false);
      Alert.alert('Tidak bisa membuka foto', 'Coba lagi atau pilih foto struk dari galeri.');
    }
  };

  const openReceiptOptions = () => Alert.alert('Scan struk', 'Ambil foto struk atau pilih gambar yang sudah ada.', [
    { text: 'Batal', style: 'cancel' },
    { text: 'Kamera', onPress: () => { void scanReceipt('camera'); } },
    { text: 'Pilih dari galeri', onPress: () => { void scanReceipt('gallery'); } },
  ]);

  const formattedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(dateObject());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>CATAT UANG MASUK DAN KELUAR</Text>
          <Text style={styles.heading}>{transactionId ? 'Edit transaksi' : 'Transaksi baru'}</Text>

          <View style={styles.modeBadge}>
            <Ionicons name={formMode === 'bisnis' ? 'storefront-outline' : 'person-outline'} size={16} color={GREEN} />
            <Text style={styles.modeBadgeText}>{formMode === 'bisnis' ? 'Keuangan warung' : 'Keuangan pribadi'}</Text>
          </View>

          <View style={styles.segment}>
            <Choice label="Pengeluaran" active={type === 'expense'} onPress={() => chooseType('expense')} />
            <Choice label="Pemasukan" active={type === 'income'} onPress={() => chooseType('income')} />
          </View>

          {type === 'expense' && !transactionId ? (
            <TouchableOpacity style={styles.scanButton} onPress={openReceiptOptions} disabled={scanningReceipt} activeOpacity={0.75}>
              <View style={styles.scanIcon}><Ionicons name={scanningReceipt ? 'hourglass-outline' : 'scan-outline'} size={20} color={GREEN} /></View>
              <View style={styles.scanCopy}>
                <Text style={styles.scanTitle}>{scanningReceipt ? 'Membaca struk…' : receiptUri ? 'Scan ulang struk' : 'Scan struk belanja'}</Text>
                <Text style={styles.scanSubtitle}>{receiptUri ? 'Foto siap · periksa nominal sebelum menyimpan' : 'Foto atau pilih gambar, nominal akan dibantu terisi'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={MUTED} />
            </TouchableOpacity>
          ) : null}

          <Text style={styles.fieldLabel}>Nominal</Text>
          <View style={styles.amountField}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              value={amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : ''}
              onChangeText={(value) => setAmount(value.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#A4AAA3"
              style={styles.amountInput}
              accessibilityLabel="Nominal transaksi dalam rupiah"
            />
          </View>
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
          {Platform.OS === 'web' ? (
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#A4AAA3"
              style={styles.textField}
              accessibilityLabel="Tanggal transaksi dengan format tahun-bulan-tanggal"
            />
          ) : (
            <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)} activeOpacity={0.75}>
              <Ionicons name="calendar-outline" size={19} color={GREEN} />
              <Text style={styles.dateValue}>{formattedDate}</Text>
              <Ionicons name="chevron-down" size={17} color={MUTED} />
            </TouchableOpacity>
          )}

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
            <Text style={styles.saveText}>{transactionId ? 'Simpan perubahan' : 'Simpan transaksi'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {Platform.OS === 'android' && showDatePicker ? (
        <DateTimePicker value={dateObject()} mode="date" display="default" onChange={handleDateChange} />
      ) : null}
      {Platform.OS === 'ios' ? (
        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.dateModalBackdrop}>
            <View style={styles.dateModal}>
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalTitle}>Pilih tanggal</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.dateDone}>Selesai</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker value={dateObject()} mode="date" display="spinner" onChange={handleDateChange} />
            </View>
          </View>
        </Modal>
      ) : null}
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
  scanButton: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#EDF3EB', borderRadius: 12, padding: 12, marginBottom: 5 },
  scanIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  scanCopy: { flex: 1, gap: 2 },
  scanTitle: { color: GREEN, fontSize: 13, fontWeight: '700' },
  scanSubtitle: { color: MUTED, fontSize: 11 },
  fieldLabel: { color: INK, fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  amountField: { height: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: LINE, borderRadius: 10, backgroundColor: '#FFFFFF' },
  currency: { color: MUTED, fontSize: 18, fontWeight: '600', marginRight: 10 },
  amountInput: { flex: 1, color: INK, fontSize: 22, fontWeight: '700', paddingVertical: 8 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { borderWidth: 1, borderColor: LINE, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#FFFFFF' },
  categoryChipSelected: { borderColor: GREEN, backgroundColor: '#E5EDE5' },
  categoryText: { color: MUTED, fontSize: 12, fontWeight: '600' },
  categoryTextSelected: { color: GREEN },
  textField: { minHeight: 48, borderWidth: 1, borderColor: LINE, borderRadius: 9, backgroundColor: '#FFFFFF', paddingHorizontal: 13, color: INK, fontSize: 14 },
  dateField: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: LINE, borderRadius: 9, backgroundColor: '#FFFFFF', paddingHorizontal: 13 },
  dateValue: { flex: 1, color: INK, fontSize: 14, fontWeight: '600' },
  dateModalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(21, 29, 23, 0.4)' },
  dateModal: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 16, paddingBottom: 24 },
  dateModalHeader: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: LINE },
  dateModalTitle: { color: INK, fontSize: 15, fontWeight: '700' },
  dateDone: { color: GREEN, fontSize: 14, fontWeight: '700', padding: 8 },
  noteField: { minHeight: 56 },
  saveButton: { minHeight: 52, backgroundColor: GREEN, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

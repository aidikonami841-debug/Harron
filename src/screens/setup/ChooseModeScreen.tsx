import React, { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppMode, useWalletStore } from '../../store/useWalletStore';

const GREEN = '#356B4B';
const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';
const LINE = '#E5E7DF';

export const ChooseModeScreen = () => {
  const [selected, setSelected] = useState<AppMode | null>(null);
  const setActiveMode = useWalletStore((state) => state.setActiveMode);
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const entrance = useRef(new Animated.Value(0)).current;
  const cardScale = useRef({ pribadi: new Animated.Value(1), bisnis: new Animated.Value(1) }).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [entrance]);

  const selectMode = (mode: AppMode) => {
    setSelected(mode);
    Animated.sequence([
      Animated.spring(cardScale[mode], { toValue: 1.025, useNativeDriver: true, speed: 28, bounciness: 5 }),
      Animated.spring(cardScale[mode], { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 4 }),
    ]).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <Animated.View
        style={[
          styles.content,
          { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
          compact && styles.contentCompact,
        ]}
      >
        <View style={styles.brandMark}><Ionicons name="wallet-outline" size={26} color={GREEN} /></View>
        <Text style={styles.eyebrow}>SELAMAT DATANG DI DOMPET KITA</Text>
        <Text style={styles.title}>Mulai dari mana?</Text>
        <Text style={styles.subtitle}>Pilih cara kamu mengatur uang. Tampilan dan catatan akan mengikuti pilihanmu.</Text>

        <Animated.View style={{ transform: [{ scale: cardScale.pribadi }] }}>
          <ModeCard
            title="Keuangan pribadi"
            description="Atur pengeluaran dan pemasukan harianmu."
            icon="person-outline"
            selected={selected === 'pribadi'}
            onPress={() => selectMode('pribadi')}
          />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: cardScale.bisnis }] }}>
          <ModeCard
            title="Keuangan warung"
            description="Catat penjualan, stok, dan biaya operasional."
            icon="storefront-outline"
            selected={selected === 'bisnis'}
            onPress={() => selectMode('bisnis')}
          />
        </Animated.View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected }}
          disabled={!selected}
          activeOpacity={0.82}
          onPress={() => selected && setActiveMode(selected)}
          style={[styles.continue, !selected && styles.continueDisabled]}
        >
          <Text style={styles.continueText}>{selected ? `Lanjut sebagai ${selected === 'bisnis' ? 'Warung' : 'Pribadi'}` : 'Pilih salah satu untuk lanjut'}</Text>
          {selected ? <Ionicons name="arrow-forward" size={18} color="#FFFFFF" /> : null}
        </TouchableOpacity>

        <Text style={styles.switchHint}>Kamu bisa mengganti mode kapan saja dari Profil.</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const ModeCard = ({
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
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.card, selected && styles.cardSelected]}
  >
    <View style={[styles.cardIcon, selected && styles.cardIconSelected]}>
      <Ionicons name={icon} size={24} color={GREEN} />
    </View>
    <View style={styles.cardText}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAPER },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 28 },
  contentCompact: { paddingHorizontal: 18 },
  brandMark: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#E6ECE3', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  eyebrow: { color: MUTED, fontSize: 10, letterSpacing: 1.3, fontWeight: '700' },
  title: { color: INK, fontSize: 30, fontWeight: '700', marginTop: 8 },
  subtitle: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 25 },
  card: { flexDirection: 'row', alignItems: 'center', minHeight: 88, padding: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, borderRadius: 13, marginBottom: 12 },
  cardSelected: { borderColor: GREEN, backgroundColor: '#F2F6F0' },
  cardIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: '#F0F2EC', justifyContent: 'center', alignItems: 'center', marginRight: 13 },
  cardIconSelected: { backgroundColor: '#E0EADF' },
  cardText: { flex: 1, minWidth: 0 },
  cardTitle: { color: INK, fontSize: 15, fontWeight: '700' },
  cardDescription: { color: MUTED, fontSize: 12, lineHeight: 17, marginTop: 4 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#C9CEC6', marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { backgroundColor: GREEN, borderColor: GREEN },
  continue: { minHeight: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: GREEN, borderRadius: 10, marginTop: 12 },
  continueDisabled: { backgroundColor: '#AFB8AE' },
  continueText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  switchHint: { color: MUTED, fontSize: 11, textAlign: 'center', marginTop: 15 },
});

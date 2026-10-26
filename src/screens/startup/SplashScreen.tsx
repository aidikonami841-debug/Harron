import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledText as Text } from '../../components/ScaledText';

const GREEN = '#356B4B';
const INK = '#202821';
const MUTED = '#778078';
const PAPER = '#F7F7F2';

export const SplashScreen = () => {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 650, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [entrance, pulse]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PAPER} />
      <Animated.View style={[styles.content, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
        <Animated.View style={[styles.logo, { transform: [{ scale: pulse }] }]}>
          <Ionicons name="wallet-outline" size={34} color="#FFFFFF" />
        </Animated.View>
        <Text style={styles.title}>FinanceApp</Text>
        <Text style={styles.subtitle}>Catat rapi, atur lebih tenang.</Text>
        <ActivityIndicator color={GREEN} size="small" style={styles.loader} />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAPER },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logo: { width: 76, height: 76, justifyContent: 'center', alignItems: 'center', backgroundColor: GREEN, borderRadius: 25, shadowColor: GREEN, shadowOpacity: 0.2, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  title: { color: INK, fontSize: 26, fontWeight: '800', letterSpacing: 0.2, marginTop: 20 },
  subtitle: { color: MUTED, fontSize: 13, marginTop: 6 },
  loader: { marginTop: 28 },
});

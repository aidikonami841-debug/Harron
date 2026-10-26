import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTabs } from './src/navigation/MainTabs';
import { SplashScreen } from './src/screens/startup/SplashScreen';
import { useWalletStore } from './src/store/useWalletStore';
import { useTransactionStore } from './src/store/useTransactionStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <StartupGate />
    </SafeAreaProvider>
  );
}

const StartupGate = () => {
  const walletHydrated = useWalletStore((state) => state.hasHydrated);
  const transactionsHydrated = useTransactionStore((state) => state.hasHydrated);
  const [minimumSplashElapsed, setMinimumSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinimumSplashElapsed(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!minimumSplashElapsed || !walletHydrated || !transactionsHydrated) return <SplashScreen />;
  return <MainTabs />;
};

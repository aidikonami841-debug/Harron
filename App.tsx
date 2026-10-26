import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTabs } from './src/navigation/MainTabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainTabs />
    </SafeAreaProvider>
  );
}

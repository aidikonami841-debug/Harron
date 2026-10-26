import React, { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TransactionsScreen } from '../screens/transactions/TransactionsScreen';
import { AddTransactionScreen } from '../screens/transactions/AddTransactionScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ChooseModeScreen } from '../screens/setup/ChooseModeScreen';
import { useWalletStore } from '../store/useWalletStore';
import { ScaledText as Text } from '../components/ScaledText';

export type MainTabParamList = {
  Beranda: undefined;
  Catatan: undefined;
  Tambah: { transactionId?: string } | undefined;
  Profil: undefined;
};

type TabName = keyof MainTabParamList;
type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<TabName, IconName> = {
  Beranda: 'home-outline',
  Catatan: 'receipt-outline',
  Tambah: 'add-circle-outline',
  Profil: 'person-circle-outline',
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  const activeMode = useWalletStore((state) => state.activeMode);
  if (!activeMode) return <ChooseModeScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Beranda" component={HomeScreen} />
        <Tab.Screen name="Catatan" component={TransactionsScreen} />
        <Tab.Screen name="Tambah" component={AddTransactionScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const AnimatedTabBar = ({ state, descriptors, navigation, insets }: BottomTabBarProps) => {
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(4)).current;
  const cellWidth = (barWidth - 8) / state.routes.length;
  const bottomInset = Math.max(insets.bottom, 8);

  useEffect(() => {
    if (!cellWidth) return;
    Animated.spring(indicatorX, {
      toValue: state.index * cellWidth + 4,
      useNativeDriver: true,
      speed: 22,
      bounciness: 5,
    }).start();
  }, [cellWidth, indicatorX, state.index]);

  return (
    <View style={[styles.tabBar, { height: 62 + bottomInset, paddingBottom: bottomInset }]} onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}>
      {cellWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.activePill, { width: Math.max(0, cellWidth - 8), bottom: bottomInset + 4, transform: [{ translateX: indicatorX }] }]}
        />
      ) : null}
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const label = typeof options?.tabBarLabel === 'string' ? options.tabBarLabel : route.name;
        const iconName = TAB_ICONS[route.name as TabName];
        const color = focused ? '#356B4B' : '#778078';
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name as TabName);
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options?.tabBarAccessibilityLabel ?? `${label} tab`}
            testID={options?.tabBarTestID}
            onPress={onPress}
            activeOpacity={0.75}
            style={styles.tabButton}
          >
            <Ionicons name={iconName} size={focused ? 23 : 21} color={color} />
            <Text numberOfLines={1} style={[styles.tabLabel, { color, fontWeight: focused ? '700' : '500' }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7DF', paddingTop: 5, paddingHorizontal: 4 },
  activePill: { position: 'absolute', top: 5, bottom: 4, left: 0, borderRadius: 13, backgroundColor: '#EDF3EB' },
  tabButton: { flex: 1, minWidth: 0, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 1 },
  tabLabel: { fontSize: 12, letterSpacing: 0.1 },
});

import React from 'react';
import { StyleSheet, Text as NativeText, TextInput as NativeTextInput } from 'react-native';
import type { TextProps, TextStyle, TextInputProps, StyleProp } from 'react-native';
import { useWalletStore } from '../store/useWalletStore';

const withScale = (style: StyleProp<TextStyle>, scale: number) => {
  const flattened = StyleSheet.flatten(style);
  if (!flattened?.fontSize) return style;
  return { ...flattened, fontSize: flattened.fontSize * scale };
};

export const ScaledText = ({ style, ...props }: TextProps) => {
  const scale = useWalletStore((state) => state.fontScale);
  return <NativeText {...props} style={withScale(style, scale)} />;
};

export const ScaledTextInput = ({ style, ...props }: TextInputProps) => {
  const scale = useWalletStore((state) => state.fontScale);
  return <NativeTextInput {...props} style={withScale(style, scale)} />;
};

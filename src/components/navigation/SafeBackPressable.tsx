import { useSafeBack } from '@/hooks/useSafeBack';
import type { Href } from 'expo-router';
import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = PressableProps & {
  fallback?: Href;
  returnTo?: string;
  style?: StyleProp<ViewStyle>;
};

/** Drop-in back control that never fires GO_BACK on an empty stack. */
export function SafeBackPressable({
  fallback,
  returnTo,
  onPress,
  children,
  ...rest
}: Props) {
  const safeBack = useSafeBack({ fallback, returnTo });

  return (
    <Pressable
      {...rest}
      onPress={(event) => {
        if (onPress) {
          onPress(event);
        } else {
          safeBack();
        }
      }}
    >
      {children}
    </Pressable>
  );
}

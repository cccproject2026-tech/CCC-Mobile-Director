import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** App-wide gradient matching Pastor Home (`Colors.appBgGradient`). */
export function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient colors={[...Colors.appBgGradient]} style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
}

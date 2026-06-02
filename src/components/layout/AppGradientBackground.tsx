import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

export default function AppGradientBackground({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient colors={[...Colors.appBgGradient]} style={[{ flex: 1 }, style]}>
      {children}
    </LinearGradient>
  );
}



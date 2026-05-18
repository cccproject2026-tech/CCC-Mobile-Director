import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  label: string;
  onPress: () => void;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, leftIcon, disabled, textColor, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      <Text style={[styles.text, textColor ? { color: textColor } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.55 },
  icon: { marginRight: 0 },
  text: {
    color: roadmapTheme.textActive,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.1,
  },
});

import type { AppointmentAvailabilityTimeSlot } from "@/types/appointment.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TimePickerSheet } from "./TimePickerSheet";

type Props = {
  slot: AppointmentAvailabilityTimeSlot;
  onPatch: (patch: Partial<AppointmentAvailabilityTimeSlot>) => void;
  onRemove: () => void;
};

export function SlotRowEditor({ slot, onPatch, onRemove }: Props) {
  const [picker, setPicker] = useState<"start" | "end" | null>(null);

  const label = (t: string, p: string) => `${t} ${p}`;

  return (
    <View style={styles.row}>
      <Pressable style={styles.timeChip} onPress={() => setPicker("start")}>
        <Text style={styles.timeText}>{label(slot.startTime, slot.startPeriod)}</Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
      </Pressable>
      <Text style={styles.to}>to</Text>
      <Pressable style={styles.timeChip} onPress={() => setPicker("end")}>
        <Text style={styles.timeText}>{label(slot.endTime, slot.endPeriod)}</Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.85)" />
      </Pressable>
      <Pressable style={styles.removeBtn} onPress={onRemove} hitSlop={8}>
        <Ionicons name="trash-outline" size={18} color="#FF8A8A" />
      </Pressable>

      <TimePickerSheet
        visible={picker === "start"}
        title="Start time"
        onClose={() => setPicker(null)}
        onSelect={(time, period) => onPatch({ startTime: time, startPeriod: period })}
      />
      <TimePickerSheet
        visible={picker === "end"}
        title="End time"
        onClose={() => setPicker(null)}
        onSelect={(time, period) => onPatch({ endTime: time, endPeriod: period })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  timeChip: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "38%",
    minWidth: 118,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  timeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    flexShrink: 1,
  },
  to: { color: "rgba(255,255,255,0.65)", fontWeight: "700", paddingHorizontal: 2 },
  removeBtn: {
    padding: 8,
    marginLeft: "auto",
  },
});

import { Colors } from "@/constants/Colors";
import { icons } from "@/constants";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

function normalizeMeetingUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export interface MenuItem {
  key: string;
  title: string;
  destructive?: boolean;
  icon?: { ios?: string; android?: string };
  onSelect: () => void;
}

type Props = {
  date: string;
  time: string;
  tz: string;
  person: string;
  role?: string;
  mode: string;
  platformIcon: any;
  avatar?: any;
  onPressChevron?: () => void;
  onPressMenu?: () => void;
  menuItems?: MenuItem[]; // OPTIONAL: If provided, shows Zeego menu. If not, uses onPressMenu
  onCall?: () => void;
  onChat?: () => void;
  onMail?: () => void;
  onViewDetails?: () => void;
  /** When set, tapping the underlined mode opens this URL (e.g. Zoom join). */
  meetingJoinUrl?: string | null;
};

const AppointmentCard: React.FC<Props> = ({
  date,
  time,
  tz,
  person,
  role,
  mode,
  platformIcon,
  avatar = icons.myProfile,
  onPressChevron,
  onPressMenu,
  menuItems,
  onCall,
  onChat,
  onMail,
  onViewDetails,
  meetingJoinUrl,
}) => {
  const showActions = Boolean(onCall || onChat || onMail);
  const showJoin = Boolean(meetingJoinUrl);
  const showDetails = Boolean(onViewDetails);
  const joinLabel = mode || "Join";
  const [platformIconFailed, setPlatformIconFailed] = React.useState(false);

  const platformBadgeIconName = React.useMemo(() => {
    const key = String(mode || "").toLowerCase();
    if (key.includes("zoom")) return "videocam-outline" as const;
    if (key.includes("google")) return "logo-google" as const;
    if (key.includes("team")) return "people-outline" as const;
    if (key.includes("phone")) return "call-outline" as const;
    return "globe-outline" as const;
  }, [mode]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.platformBadge}>
          {platformIcon && !platformIconFailed ? (
            <Image
              source={platformIcon}
              style={styles.platformBadgeIcon}
              resizeMode="contain"
              onError={() => setPlatformIconFailed(true)}
            />
          ) : (
            <Ionicons name={platformBadgeIconName} size={20} color="rgba(234,247,255,0.95)" />
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.timeText} numberOfLines={1}>
            {time}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {date} · {tz}
          </Text>
        </View>

        <View style={styles.rightControls}>
          {(onPressMenu || menuItems) && (
              <Pressable
                onPress={() => {
                  if (menuItems?.length) {
                    Alert.alert("Meeting options", undefined, [
                      ...menuItems
                        .filter((item) => !item.key.startsWith("separator"))
                        .map((item) => ({
                          text: item.title,
                          style: item.destructive ? ("destructive" as const) : "default",
                          onPress: item.onSelect,
                        })),
                      { text: "Cancel", style: "cancel" },
                    ]);
                  } else {
                    onPressMenu?.();
                  }
                }}
                hitSlop={12}
                style={styles.iconButton}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="rgba(234,247,255,0.95)" />
              </Pressable>
            )}
          {onPressChevron && (
            <Pressable onPress={onPressChevron} hitSlop={12} style={styles.iconButton}>
              <Ionicons name="chevron-forward" size={18} color="rgba(234,247,255,0.95)" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.personRow}>
        <Image source={avatar} style={styles.avatar} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.personName} numberOfLines={1}>
            {person}
          </Text>
          {role ? (
            <Text style={styles.personRole} numberOfLines={1}>
              {role}
            </Text>
          ) : null}
        </View>
        <View style={styles.modeChip}>
          <Text style={styles.modeChipText} numberOfLines={1}>
            {mode}
          </Text>
        </View>
      </View>

      {(showJoin || showDetails || showActions) && <View style={styles.divider} />}

      {(showJoin || showDetails || showActions) ? (
        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>
            {showJoin ? (
              <Pressable
                style={styles.joinBtn}
                onPress={() => {
                  const url = normalizeMeetingUrl(String(meetingJoinUrl || ""));
                  Linking.openURL(url).catch(() => {});
                }}
                hitSlop={10}
              >
                <Ionicons name="videocam-outline" size={16} color="#0E2A47" />
                <Text style={styles.joinBtnText} numberOfLines={1}>
                  Join {joinLabel}
                </Text>
              </Pressable>
            ) : null}

            {showDetails ? (
              <Pressable style={styles.detailsBtn} onPress={onViewDetails} hitSlop={10}>
                <Ionicons name="information-circle-outline" size={16} color="#EAF7FF" />
                <Text style={styles.detailsBtnText} numberOfLines={1}>
                  View details
                </Text>
              </Pressable>
            ) : null}
          </View>

          {showActions ? (
            <View style={styles.actions}>
              {onCall ? (
                <Pressable onPress={onCall} hitSlop={12} style={styles.actionIconBtn}>
                  <Ionicons name="call-outline" size={18} color="#EAF7FF" />
                </Pressable>
              ) : null}
              {onChat ? (
                <Pressable onPress={onChat} hitSlop={12} style={styles.actionIconBtn}>
                  <MaterialCommunityIcons name="message-outline" size={18} color="#EAF7FF" />
                </Pressable>
              ) : null}
              {onMail ? (
                <Pressable onPress={onMail} hitSlop={12} style={styles.actionIconBtn}>
                  <MaterialIcons name="mail-outline" size={18} color="#EAF7FF" />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.darkBlue,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  platformBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  platformBadgeIcon: { width: "100%", height: "100%" },
  timeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  metaText: { marginTop: 2, color: "rgba(234,247,255,0.75)", fontSize: 12, fontWeight: "700" },
  rightControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  personName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  personRole: { marginTop: 2, color: "rgba(234,247,255,0.65)", fontSize: 12, fontWeight: "700" },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modeChipText: { color: "#EAF7FF", fontWeight: "900", fontSize: 12 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)", marginTop: 12 },
  footerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  joinBtnText: { color: "#0E2A47", fontWeight: "900", fontSize: 12 },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  detailsBtnText: { color: "#EAF7FF", fontWeight: "900", fontSize: 12 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
});

export default AppointmentCard;

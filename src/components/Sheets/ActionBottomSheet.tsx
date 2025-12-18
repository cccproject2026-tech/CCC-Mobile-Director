import React, { forwardRef, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ActionItem {
    icon: string;
    label: string;
    onPress: () => void;
}

export interface ActionBottomSheetProps {
    title: string;
    subtitle?: string;
    image?: string;
    actions: ActionItem[];
    onClose: () => void;
    colorScheme?: {
        background?: string;
        text?: string;
        accent?: string;
    };
}

const ActionBottomSheet = forwardRef<BottomSheetModal, ActionBottomSheetProps>(
    ({ title, subtitle, image, actions, onClose,
        colorScheme = {
            background: "#1E3A6F",
            text: "#FFFFFF",
            accent: "#FFC107",
        }
    }, ref) => {

        const { bottom } = useSafeAreaInsets();
        const snapPoints = useMemo(() => ["50%", "80%"], []);

        const backdrop = useCallback((props: any) => (
            <BottomSheetBackdrop {...props}
                opacity={0.5}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ), []);

        const handlePress = (fn: () => void) => {
            onClose();
            setTimeout(() => fn(), 200);
        }

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                onDismiss={onClose}
                enablePanDownToClose
                backdropComponent={backdrop}
                handleIndicatorStyle={{ display: "none" }}
                enableDynamicSizing={false}
                backgroundStyle={[
                    styles.sheetBackground, { backgroundColor: colorScheme.background }
                ]}
            >

                <BottomSheetView style={[styles.container, { paddingBottom: bottom + 20 }]}>

                    {/* Close */}
                    <Pressable onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={26} color={colorScheme.text} />
                    </Pressable>

                    {/* Header */}
                    <View style={[styles.header, { borderColor: colorScheme.text + "45" }]}>

                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.placeholder, { backgroundColor: colorScheme.text + "25" }]}>
                                <Ionicons name="person-outline" size={30} color={colorScheme.text} />
                            </View>
                        )}

                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: colorScheme.text }]}>{title}</Text>

                            {subtitle && (
                                <View style={styles.subRow}>
                                    <View style={[styles.dot, { backgroundColor: colorScheme.accent }]} />
                                    <Text style={[styles.subtitle, { color: colorScheme.accent }]}>{subtitle}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Menu */}
                    <View style={{ flex: 1 }}>
                        {actions.map((item, i) => (
                            <Pressable
                                key={i}
                                onPress={() => handlePress(item.onPress)}
                                style={styles.menuItem}
                            >
                                <Ionicons name={item.icon as any} size={22} color={colorScheme.text} />
                                <Text style={[styles.menuLabel, { color: colorScheme.text }]}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    });

export default ActionBottomSheet;

export const styles = StyleSheet.create({
    sheetBackground: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    closeBtn: {
        position: "absolute",
        right: 16,
        top: 16,
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 16
    },

    avatar: {
        width: 56, height: 56, borderRadius: 16, marginRight: 12
    },
    placeholder: {
        width: 56, height: 56, borderRadius: 16,
        alignItems: "center", justifyContent: "center",
        marginRight: 12
    },

    title: {
        fontSize: 20, fontWeight: "700", marginBottom: 6
    },
    subtitle: { fontSize: 15, fontWeight: "600" },
    subRow: { flexDirection: "row", alignItems: "center" },

    dot: {
        width: 6, height: 6, borderRadius: 3, marginRight: 6
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 12
    },

    menuLabel: {
        fontSize: 17, fontWeight: "500",
        marginLeft: 16
    }
});

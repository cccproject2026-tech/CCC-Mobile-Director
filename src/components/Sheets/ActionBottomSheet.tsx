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
    ({
        title,
        subtitle,
        image,
        actions,
        onClose,
        colorScheme = {
            background: "#1E3A6F",
            text: "#FFFFFF",
            accent: "#FFC107",
        }
    }, ref) => {

        const { bottom } = useSafeAreaInsets();
        const snapPoints = useMemo(() => ["50%", "80%"], []);

        const backdrop = useCallback((props: any) => (
            <BottomSheetBackdrop
                {...props}
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
                    styles.sheetBackground,
                    { backgroundColor: colorScheme.background }
                ]}
            >
                <BottomSheetView style={[styles.container, { paddingBottom: bottom + 20 }]}>
                    {/* Header with Close Icon */}
                    <View style={[styles.header, { borderColor: colorScheme.text + "45" }]}>
                        {/* Close Button - Top Right Corner */}
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colorScheme.text} />
                        </Pressable>

                        {/* Avatar */}
                        {image ? (
                            <Image source={{ uri: image }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.placeholder, { backgroundColor: colorScheme.text + "25" }]}>
                                <Ionicons name="person-outline" size={30} color={colorScheme.text} />
                            </View>
                        )}

                        {/* Text Content */}
                        <View style={styles.textContainer}>
                            <Text
                                style={[styles.title, { color: colorScheme.text }]}
                                numberOfLines={2}
                            >
                                {title}
                            </Text>

                            {subtitle && (
                                <View style={styles.subRow}>
                                    <View style={[styles.dot, { backgroundColor: colorScheme.accent }]} />
                                    <Text
                                        style={[styles.subtitle, { color: colorScheme.accent }]}
                                        numberOfLines={2}
                                    >
                                        {subtitle}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Menu Actions */}
                    <View style={styles.menuContainer}>
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

    header: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingRight: 48, // Extra padding on right for close button
        marginTop: 16,
        marginBottom: 20,
        position: 'relative', // For absolute positioning of close button
    },

    closeBtn: {
        position: "absolute",
        right: 12,
        top: 12,
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        zIndex: 10,
    },

    avatar: {
        width: 56,
        height: 56,
        borderRadius: 16,
        marginRight: 14,
        flexShrink: 0,
    },

    placeholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
        flexShrink: 0,
    },

    textContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 4,
    },

    title: {
        fontSize: 19,
        fontWeight: "700",
        marginBottom: 6,
        lineHeight: 24,
    },

    subtitle: {
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 18,
        flex: 1,
    },

    subRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: 'wrap',
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
        flexShrink: 0,
    },

    menuContainer: {
        flex: 1,
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 12,
    },

    menuLabel: {
        fontSize: 17,
        fontWeight: "500",
        marginLeft: 16,
    }
});

import React, { memo } from "react";
// import * as DropdownMenu from "zeego/dropdown-menu";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type MenuItem = {
    key: string;
    title: string;
    destructive?: boolean;
    onSelect: () => void;
};

interface Props {
    menuItems?: MenuItem[];        // If provided → dropdown menu
    fallbackPress?: () => void;    // If no menuItems → fallback action
}

const ContextMenu = ({ menuItems, fallbackPress }: Props) => {

    // No menu items → simple clickable button
    if (!menuItems) {
        return (
            <TouchableOpacity style={styles.triggerBtn} onPress={fallbackPress}>
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
        );
    }

    return (
        <View>
            <Text>ContextMenu</Text>
            </View>
    );
};

export default memo(ContextMenu);

const styles = StyleSheet.create({
    triggerBtn: {
        alignItems: "center",
        justifyContent: "center",
    },
});

import React, { memo } from "react";
import * as DropdownMenu from "zeego/dropdown-menu";
import { TouchableOpacity, StyleSheet } from "react-native";
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
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <TouchableOpacity style={styles.triggerBtn}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
                {menuItems.map(item => (
                    <DropdownMenu.Item
                        key={item.key}
                        destructive={item.destructive}
                        onSelect={item.onSelect}
                    >
                        <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                ))}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

export default memo(ContextMenu);

const styles = StyleSheet.create({
    triggerBtn: {
        padding: 6,
        marginLeft: 4,
        alignItems: "center",
        justifyContent: "center",
    },
});

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type View as RNView,
} from 'react-native';

export type MenuAnchorRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type MenuPosition = {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
};

const MENU_MAX_HEIGHT = 300;
const MENU_MARGIN = 8;

/** Position a dropdown below the anchor, or above if there is not enough room. */
export function computeAnchoredMenuPosition(
    anchor: MenuAnchorRect,
    options?: { itemCount?: number; maxHeight?: number; margin?: number },
): MenuPosition {
    const windowHeight = Dimensions.get('window').height;
    const maxHeight = options?.maxHeight ?? MENU_MAX_HEIGHT;
    const margin = options?.margin ?? MENU_MARGIN;
    const estimatedHeight = Math.min(
        maxHeight,
        (options?.itemCount ?? 8) * 50 + 16,
    );

    const spaceBelow = windowHeight - (anchor.y + anchor.height) - margin;
    const spaceAbove = anchor.y - margin;

    if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
        return {
            top: anchor.y + anchor.height + margin,
            right: 16,
        };
    }

    return {
        top: Math.max(margin, anchor.y - estimatedHeight - margin),
        right: 16,
    };
}

/** Dismiss keyboard, measure anchor in window coords, then open menu near the button. */
export function openAnchoredMenu(
    anchorRef: RNView | null,
    options: {
        itemCount: number;
        onOpen: (position: MenuPosition) => void;
        keyboardDismissDelay?: number;
    },
): void {
    Keyboard.dismiss();

    const measureAndOpen = () => {
        if (!anchorRef) {
            options.onOpen({ bottom: 100, right: 16 });
            return;
        }

        anchorRef.measureInWindow((x, y, width, height) => {
            options.onOpen(
                computeAnchoredMenuPosition(
                    { x, y, width, height },
                    { itemCount: options.itemCount },
                ),
            );
        });
    };

    const delay = options.keyboardDismissDelay ?? (Platform.OS === 'ios' ? 120 : 60);
    setTimeout(measureAndOpen, delay);
}

export interface MenuItem {
    id: string;
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    customIcon?: React.ReactNode;
    onPress: () => void;
    textColor?: string;
    backgroundColor?: string;
    disabled?: boolean;
    showDividerAfter?: boolean;
}

export interface CustomMenuProps {
    items: MenuItem[];
    visible: boolean;
    onClose?: () => void;
    position?: MenuPosition;
    backgroundColor?: string;
    borderRadius?: number;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
    minWidth?: number;
    maxWidth?: number;
    iconSize?: number;
    itemPadding?: {
        horizontal?: number;
        vertical?: number;
    };
    gap?: number;
    showIcons?: boolean;
    itemTextStyle?: {
        fontSize?: number;
        fontWeight?: string;
        color?: string;
    };
    dividerColor?: string;
    dividerHeight?: number;
}

export const CustomMenu: React.FC<CustomMenuProps> = ({
    items,
    visible,
    onClose,
    position = { top: 50, right: 16 },
    backgroundColor = '#fff',
    borderRadius = 12,
    shadowColor = '#000',
    shadowOpacity = 0.25,
    shadowRadius = 8,
    elevation = 5,
    minWidth = 200,
    maxWidth = 300,
    iconSize = 20,
    itemPadding = { horizontal: 16, vertical: 12 },
    gap = 12,
    showIcons = true,
    itemTextStyle = { fontSize: 15, fontWeight: '500', color: '#1A4882' },
    dividerColor = 'rgba(0,0,0,0.1)',
    dividerHeight = 1,
}) => {
    if (!visible) return null;

    const handleItemPress = (item: MenuItem) => {
        if (!item.disabled) {
            item.onPress();
            onClose?.();
        }
    };

    return (
        <View style={[styles.overlay, { zIndex: 10000 }]}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
            <ScrollView
                showsVerticalScrollIndicator={true}
                style={[
                    styles.menuContainer,
                    {
                        backgroundColor,
                        borderRadius,
                        shadowColor,
                        shadowOpacity,
                        shadowRadius,
                        elevation,
                        minWidth,
                        maxWidth,
                        ...position,
                    },
                ]}
            >
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        <TouchableOpacity
                            style={[
                                styles.menuItem,
                                {
                                    paddingHorizontal: itemPadding.horizontal,
                                    paddingVertical: itemPadding.vertical,
                                    backgroundColor: item.backgroundColor || 'transparent',
                                    opacity: item.disabled ? 0.5 : 1,
                                },
                                {marginBottom: (items.length - 1 ) === index ? 15 : 0},
                                !showIcons && styles.menuItemWithoutIcon,
                            ]}
                            onPress={() => handleItemPress(item)}
                            disabled={item.disabled}
                            activeOpacity={0.6}
                        >
                            {showIcons && (
                                <View style={[styles.iconContainer, { width: iconSize + gap }]}>
                                    {item.customIcon ? (
                                        item.customIcon
                                    ) : item.icon ? (
                                        <Ionicons
                                            name={item.icon}
                                            size={iconSize}
                                            color={item.textColor || itemTextStyle.color}
                                        />
                                    ) : null}
                                </View>
                            )}
                            <Text
                                style={[
                                    styles.menuItemText,
                                    {
                                        fontSize: itemTextStyle.fontSize,
                                        fontWeight: itemTextStyle.fontWeight as any,
                                        color: item.textColor || itemTextStyle.color,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>

                        {item.showDividerAfter && index < items.length - 1 && (
                            <View
                                style={[
                                    styles.divider,
                                    {
                                        backgroundColor: dividerColor,
                                        height: dividerHeight,
                                    },
                                ]}
                            />
                        )}
                    </React.Fragment>
                ))}
            </ScrollView>
        </View>
    );
};

export const TextIcon: React.FC<{ text: string; color?: string; fontSize?: number }> = ({
    text,
    color = '#1A4882',
    fontSize = 18,
}) => (
    <Text style={{ fontSize, fontWeight: '600', color }}>{text}</Text>
);

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    menuContainer: {
        maxHeight: 300,
        position: 'absolute',
        paddingVertical: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemWithoutIcon: {
        paddingLeft: 20,
    },
    iconContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    menuItemText: {
        flex: 1,
    },
    divider: {
        marginHorizontal: 12,
    },
});

export default CustomMenu;
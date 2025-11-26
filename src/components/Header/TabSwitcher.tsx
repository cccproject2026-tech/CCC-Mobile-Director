import React, { memo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface TabItem {
    key: string;
    label: string;
    badge?: number;
}

interface TabSwitcherProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (key: string) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = memo(
    ({ tabs, activeTab, onChange }) => {
        return (
            <View style={styles.wrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {tabs.map((tab, index) => {
                        const isActive = activeTab === tab.key;
                        const hasBadge = tab.badge !== undefined && tab.badge > 0;

                        return (
                            <View
                                key={tab.key}
                                style={[styles.tabWrapper, index > 0 && styles.tabMarginLeft]}
                            >
                                <Pressable
                                    onPress={() => onChange(tab.key)}
                                    hitSlop={10}
                                    style={[
                                        styles.tabButton,
                                        isActive ? styles.activeTab : styles.inactiveTab,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tabText,
                                            isActive ? styles.activeTabText : styles.inactiveTabText,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {tab.label}
                                    </Text>
                                </Pressable>

                                {isActive && hasBadge && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{tab.badge}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    tabWrapper: {
        position: 'relative',
    },
    tabMarginLeft: {
        marginLeft: 8,
    },
    tabButton: {
        paddingHorizontal: Platform.OS === 'android' ? 16 : 20,
        paddingVertical: 12,
        borderRadius: Platform.OS === 'android' ? 12 : 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    inactiveTab: {
        backgroundColor: '#14517D',
    },
    tabText: {
        fontSize: Platform.OS === 'android' ? 13 : 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeTabText: {
        color: '#1a5b77',
    },
    inactiveTabText: {
        color: '#fff',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1a5b77',
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
});

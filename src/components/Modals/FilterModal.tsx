import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export type FilterOption = {
    label: string;
    options?: string[];
    isExpandable?: boolean;
};

type FilterModalProps = {
    visible: boolean;
    onClose: () => void;
    selectedFilter: string;
    onFilterSelect: (filter: string) => void;
    filterOptions: FilterOption[];
};

const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    selectedFilter,
    onFilterSelect,
    filterOptions,
}) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleExpand = useCallback((label: string) => {
        setExpandedSection(prev => (prev === label ? null : label));
    }, []);

    const handleFilterSelect = useCallback(
        (filter: string, parent?: FilterOption) => {
            onFilterSelect(filter);

            const expandable = parent?.isExpandable || (parent?.options?.length ?? 0) > 0;

            if (!expandable) {
                onClose();
            }
        },
        [onFilterSelect, onClose]
    );

    const handleClearSort = useCallback(() => {
        onFilterSelect('All');
        onClose();
    }, [onFilterSelect, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Background Overlay */}
            <Pressable style={styles.overlay} onPress={onClose}>
                {/* Inner Modal */}
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Filter Sections */}
                    {filterOptions.map((opt, index) => {
                        const expanded = expandedSection === opt.label;

                        return (
                            <View
                                key={opt.label}
                                style={[
                                    styles.section,
                                    index < filterOptions.length - 1 && styles.sectionBorder
                                ]}
                            >
                                {/* Section Header */}
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>{opt.label}</Text>

                                    {(opt.options || opt.isExpandable) ? (
                                        <Pressable
                                            onPress={() => toggleExpand(opt.label)}
                                            style={[
                                                styles.expandButton,
                                                expanded && styles.expandButtonActive
                                            ]}
                                        >
                                            <Ionicons
                                                name={expanded ? 'chevron-up' : 'chevron-down'}
                                                size={Platform.OS === 'android' ? 18 : 24}
                                                color={expanded ? '#fff' : '#1a5b77'}
                                            />
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            onPress={() => handleFilterSelect(opt.label, opt)}
                                            style={styles.radioOuter}
                                        >
                                            {selectedFilter === opt.label && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </Pressable>
                                    )}
                                </View>

                                {/* Expanded Options */}
                                {expanded && opt.options && (
                                    <View style={{ marginTop: 6 }}>
                                        {opt.options.map(option => (
                                            <Pressable
                                                key={option}
                                                onPress={() => handleFilterSelect(option, opt)}
                                                style={styles.optionRow}
                                            >
                                                <View
                                                    style={[
                                                        styles.radioOuter,
                                                        selectedFilter === option && styles.radioOuterActive
                                                    ]}
                                                >
                                                    {selectedFilter === option && (
                                                        <View style={styles.radioInnerSmall} />
                                                    )}
                                                </View>
                                                <Text style={styles.optionLabel}>{option}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {/* Clear Sort */}
                    <View style={styles.clearSection}>
                        <Pressable style={styles.optionRow} onPress={handleClearSort}>
                            <View style={styles.radioOuter} />
                            <Text style={styles.optionLabel}>Clear Sort</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default FilterModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },

    modalContainer: {
        width: '90%',
        maxWidth: Platform.OS === 'android' ? 350 : 400,
        backgroundColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 16 : 20,
        overflow: 'hidden',
    },

    section: {
        padding: Platform.OS === 'android' ? 16 : 24,
    },

    sectionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 12 : 16,
    },

    sectionTitle: {
        color: '#1a5b77',
        fontSize: Platform.OS === 'android' ? 16 : 20,
        fontWeight: '600',
    },

    expandButton: {
        width: Platform.OS === 'android' ? 36 : 48,
        height: Platform.OS === 'android' ? 36 : 48,
        borderRadius: Platform.OS === 'android' ? 8 : 12,
        borderWidth: 2,
        borderColor: '#1a5b77',
        alignItems: 'center',
        justifyContent: 'center',
    },

    expandButtonActive: {
        backgroundColor: '#1a5b77',
    },

    radioOuter: {
        width: Platform.OS === 'android' ? 20 : 24,
        height: Platform.OS === 'android' ? 20 : 24,
        borderRadius: Platform.OS === 'android' ? 10 : 12,
        backgroundColor: '#d1d5db',
        borderWidth: 2,
        borderColor: '#9ca3af',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Platform.OS === 'android' ? 12 : 16,
    },

    radioOuterActive: {
        backgroundColor: '#1a5b77',
        borderColor: '#1a5b77',
    },

    radioInner: {
        width: Platform.OS === 'android' ? 10 : 12,
        height: Platform.OS === 'android' ? 10 : 12,
        backgroundColor: '#1a5b77',
        borderRadius: Platform.OS === 'android' ? 5 : 6,
    },

    radioInnerSmall: {
        width: Platform.OS === 'android' ? 8 : 10,
        height: Platform.OS === 'android' ? 8 : 10,
        backgroundColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 4 : 5,
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Platform.OS === 'android' ? 8 : 12,
    },

    optionLabel: {
        color: '#1a5b77',
        fontSize: Platform.OS === 'android' ? 14 : 18,
        fontWeight: '500',
    },

    clearSection: {
        padding: Platform.OS === 'android' ? 16 : 24,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
});

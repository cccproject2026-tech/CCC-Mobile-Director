import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FieldType = 'text' | 'textarea' | 'upload' | 'datepicker' | 'section' | 'assessment';

interface FieldTypeSelectorProps {
    onSelectType: (type: FieldType) => void;
    onClose: () => void;
}

const FIELD_TYPES = [
    { type: 'text' as FieldType, label: 'Text Field', icon: 'text-outline' },
    { type: 'textarea' as FieldType, label: 'Text Area', icon: 'document-text-outline' },
    { type: 'upload' as FieldType, label: 'Upload Button', icon: 'cloud-upload-outline' },
    { type: 'datepicker' as FieldType, label: 'Date Picker', icon: 'calendar-outline' },
    { type: 'section' as FieldType, label: 'Section', icon: 'grid-outline' },
    { type: 'assessment' as FieldType, label: 'Assessment', icon: 'document-outline' },
];

const FieldTypeSelector = forwardRef<BottomSheetModal, FieldTypeSelectorProps>(
    ({ onSelectType, onClose }, ref) => {
        const snapPoints = useMemo(() => ['50%'], []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                    pressBehavior="close"
                />
            ),
            []
        );

        const handleSelect = (type: FieldType) => {
            onSelectType(type);
            onClose();
        };

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
                onDismiss={onClose}
            >
                <LinearGradient
                    colors={['#264387', '#1D548D', '#176192']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.gradientContainer}
                >
                    <BottomSheetView style={styles.container}>
                        {/* Header */}
                        <Text style={styles.title}>Add field popup</Text>

                        {/* Field Types */}
                        <View style={styles.fieldList}>
                            {FIELD_TYPES.map((item, index) => (
                                <TouchableOpacity
                                    key={item.type}
                                    style={[
                                        styles.fieldItem,
                                        index === FIELD_TYPES.length - 1 && styles.fieldItemLast
                                    ]}
                                    onPress={() => handleSelect(item.type)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color="#4A90E2"
                                    />
                                    <Text style={styles.fieldLabel}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </BottomSheetView>
                </LinearGradient>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        display: 'none',
    },
    handleIndicator: {
        display: 'none',
    },
    gradientContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4A90E2',
        marginBottom: 24,
    },
    fieldList: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    fieldItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        gap: 16,
    },
    fieldItemLast: {
        borderBottomWidth: 0,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E3A6F',
    },
});

export default FieldTypeSelector;

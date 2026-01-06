// components/Modals/RecommendationsModal.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface Recommendation {
    id: string;
    text: string;
    selected: boolean;
}

interface RecommendationsModalProps {
    visible: boolean;
    onClose: () => void;
    layerNumber: number;
    layerTitle: string;
    initialRecommendations?: string[];
    onSave: (recommendations: string[]) => void;
}

const RecommendationsModal: React.FC<RecommendationsModalProps> = ({
    visible,
    onClose,
    layerNumber,
    layerTitle,
    initialRecommendations = [],
    onSave,
}) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);

    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        if (visible) {
            // Initialize recommendations
            const recs = initialRecommendations.length > 0
                ? initialRecommendations.map((text, index) => ({
                    id: `${index}`,
                    text,
                    selected: false,
                }))
                : [{ id: '1', text: '', selected: false }];
            setRecommendations(recs);
            setIsSelectionMode(false);
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible, initialRecommendations]);

    const handleToggleSelection = (id: string) => {
        setRecommendations((prev) =>
            prev.map((rec) =>
                rec.id === id ? { ...rec, selected: !rec.selected } : rec
            )
        );
    };

    const handleAddRecommendation = () => {
        setRecommendations((prev) => [
            ...prev,
            { id: Date.now().toString(), text: '', selected: false },
        ]);
    };

    const handleUpdateRecommendation = (id: string, text: string) => {
        setRecommendations((prev) =>
            prev.map((rec) => (rec.id === id ? { ...rec, text } : rec))
        );
    };

    const handleDeleteSelected = () => {
        const selectedCount = recommendations.filter((r) => r.selected).length;

        if (selectedCount === 0) {
            Alert.alert('No Selection', 'Please select recommendations to delete.');
            return;
        }

        if (recommendations.length === selectedCount) {
            Alert.alert('Error', 'You must keep at least one recommendation.');
            return;
        }

        Alert.alert(
            'Delete Recommendations',
            `Are you sure you want to delete ${selectedCount} recommendation(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setRecommendations((prev) => prev.filter((r) => !r.selected));
                        setIsSelectionMode(false);
                    },
                },
            ]
        );
    };

    const handleSave = () => {
        const validRecs = recommendations
            .filter((r) => r.text.trim().length > 0)
            .map((r) => r.text);

        if (validRecs.length === 0) {
            Alert.alert('Error', 'Please add at least one recommendation.');
            return;
        }

        onSave(validRecs);
        onClose();
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.7}
            />
        ),
        []
    );

    const selectedCount = recommendations.filter((r) => r.selected).length;

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
            onDismiss={onClose}
            enableDynamicSizing={false}
        >
            <View style={styles.container}>
                <LinearGradient
                    colors={['#264387', '#1D548D', '#176192']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.gradientContainer}
                >
                    {/* Close Button */}
                    <View style={styles.closeButtonContainer}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Header with Gradient Border */}
                    <View style={styles.headerContainer}>
                        <LinearGradient
                            colors={['#A855F7', '#38BDF8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.headerGradientBorder}
                        >
                            <View style={styles.headerContent}>
                                <Text style={styles.modalTitle}>
                                    Layer {layerNumber} - Recommendations
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Select Button */}
                    {!isSelectionMode && (
                        <View style={styles.selectButtonContainer}>
                            <TouchableOpacity
                                style={styles.selectModeButton}
                                onPress={() => setIsSelectionMode(true)}
                            >
                                <Ionicons name="checkmark-outline" size={20} color="#fff" />
                                <Text style={styles.selectModeText}>Select</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Scrollable Content */}
                    <BottomSheetScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Recommendations Container */}
                        <View style={styles.recommendationsContainer}>
                            {recommendations.map((rec) => (
                                <TouchableOpacity
                                    key={rec.id}
                                    style={styles.recommendationItem}
                                    onPress={() =>
                                        isSelectionMode && handleToggleSelection(rec.id)
                                    }
                                    disabled={!isSelectionMode}
                                    activeOpacity={isSelectionMode ? 0.7 : 1}
                                >
                                    {isSelectionMode ? (
                                        <View
                                            style={[
                                                styles.checkbox,
                                                rec.selected && styles.checkboxSelected,
                                            ]}
                                        >
                                            {rec.selected && (
                                                <Ionicons name="checkmark" size={18} color="#1A1354" />
                                            )}
                                        </View>
                                    ) : (
                                        <Ionicons name="star" size={22} color="#FDB022" />
                                    )}
                                    <TextInput
                                        style={styles.recommendationInput}
                                        value={rec.text}
                                        onChangeText={(text) =>
                                            handleUpdateRecommendation(rec.id, text)
                                        }
                                        placeholder="Enter recommendation"
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        editable={!isSelectionMode}
                                        multiline
                                    />
                                </TouchableOpacity>
                            ))}

                            {/* Add Suggestion Button */}
                            {!isSelectionMode && (
                                <TouchableOpacity
                                    style={styles.addSuggestionButton}
                                    onPress={handleAddRecommendation}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.addSuggestionText}>Suggestion</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Spacer for bottom buttons */}
                        <View style={{ height: 100 }} />
                    </BottomSheetScrollView>

                    {/* Delete Icon - Only in Selection Mode */}
                    {isSelectionMode && selectedCount > 0 && (
                        <View style={styles.deleteIconContainer}>
                            <TouchableOpacity
                                style={styles.deleteIcon}
                                onPress={handleDeleteSelected}
                            >
                                <Ionicons name="trash-outline" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Action Buttons - Fixed at Bottom */}
                    <View style={styles.actionButtonsContainer}>
                        <View style={styles.actionButtons}>
                            {isSelectionMode ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={() => {
                                            setIsSelectionMode(false);
                                            setRecommendations((prev) =>
                                                prev.map((r) => ({ ...r, selected: false }))
                                            );
                                        }}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.deleteButton,
                                            selectedCount === 0 && styles.deleteButtonDisabled,
                                        ]}
                                        onPress={handleDeleteSelected}
                                        disabled={selectedCount === 0}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={20}
                                            color={selectedCount === 0 ? 'rgba(255,255,255,0.3)' : '#fff'}
                                        />
                                        <Text
                                            style={[
                                                styles.deleteButtonText,
                                                selectedCount === 0 && styles.deleteButtonTextDisabled,
                                            ]}
                                        >
                                            Delete ({selectedCount})
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                        <Text style={styles.saveButtonText}>Save Changes</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </BottomSheetModal>
    );
};

export default RecommendationsModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomSheetBackground: {
        backgroundColor: 'transparent',
    },
    handleIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        width: 36,
        height: 4,
    },
    gradientContainer: {
        flex: 1,
    },
    closeButtonContainer: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    closeButton: {
        padding: 4,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerGradientBorder: {
        borderRadius: 20,
        padding: 2,
    },
    headerContent: {
        backgroundColor: '#264387',
        borderRadius: 18,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    selectButtonContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: 'flex-end',
    },
    selectModeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'transparent',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    selectModeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    recommendationsContainer: {
        // backgroundColor: 'rgba(30, 60, 120, 0.25)',
        // borderRadius: 20,
        // padding: 16,
        // borderWidth: 1.5,
        // borderColor: 'rgba(100, 200, 255, 0.3)',
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(30, 50, 100, 0.4)',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: '#E8E8E8',
        borderColor: '#E8E8E8',
    },
    recommendationInput: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
        padding: 0,
        lineHeight: 22,
    },
    addSuggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        marginTop: 8,
        backgroundColor: 'transparent',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    addSuggestionText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    deleteIconContainer: {
        position: 'absolute',
        bottom: 120,
        alignSelf: 'center',
        zIndex: 10,
    },
    deleteIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(60, 100, 180, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 14,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4169E1',
    },
    saveButton: {
        flex: 1,
        backgroundColor: 'rgba(40, 60, 120, 0.6)',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    deleteButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 107, 107, 0.3)',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 107, 107, 0.5)',
    },
    deleteButtonDisabled: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    deleteButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
});
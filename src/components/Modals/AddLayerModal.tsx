// components/Modals/AddLayerModal.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface AddLayerModalProps {
    visible: boolean;
    onClose: () => void;
    onLayerCreated: (layer: any) => void;
    layerNumber: number;
}

const AddLayerModal: React.FC<AddLayerModalProps> = ({
    visible,
    onClose,
    onLayerCreated,
    layerNumber,
}) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['75%'], []);

    const [layerTitle, setLayerTitle] = useState('');
    const [choices, setChoices] = useState<Array<{ id: string; text: string }>>([
        { id: '1', text: '' },
    ]);
    const [recommendations, setRecommendations] = useState<Array<{ id: string; text: string }>>([
        { id: '1', text: '' },
    ]);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible]);

    const handleAddChoice = () => {
        setChoices([...choices, { id: Date.now().toString(), text: '' }]);
    };

    const handleUpdateChoice = (index: number, text: string) => {
        const updated = [...choices];
        updated[index].text = text;
        setChoices(updated);
    };

    const handleRemoveChoice = (index: number) => {
        if (choices.length > 1) {
            setChoices(choices.filter((_, i) => i !== index));
        }
    };

    const handleAddRecommendation = () => {
        setRecommendations([...recommendations, { id: Date.now().toString(), text: '' }]);
    };

    const handleUpdateRecommendation = (index: number, text: string) => {
        const updated = [...recommendations];
        updated[index].text = text;
        setRecommendations(updated);
    };

    const handleRemoveRecommendation = (index: number) => {
        if (recommendations.length > 1) {
            setRecommendations(recommendations.filter((_, i) => i !== index));
        }
    };

    const handleCreateLayer = () => {
        if (!layerTitle.trim()) {
            return;
        }

        const newLayer = {
            title: layerTitle,
            choices: choices
                .filter((c) => c.text.trim().length > 0)
                .map((c) => ({
                    text: c.text,
                })),
        };

        onLayerCreated(newLayer);
        resetForm();
    };

    const resetForm = () => {
        setLayerTitle('');
        setChoices([{ id: '1', text: '' }]);
        setRecommendations([{ id: '1', text: '' }]);
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

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
            keyboardBehavior="interactive"
            android_keyboardInputMode="adjustResize"
        >
            <View style={styles.container}>
                <LinearGradient
                    colors={['#264387', '#1D548D', '#176192']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.gradientContainer}
                >
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add Layer</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <BottomSheetScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        {/* Layer Container */}
                        <View style={styles.layerContainer}>
                            <Text style={styles.layerTitle}>Layer {layerNumber}</Text>

                            {/* Layer Title Input */}
                            <TextInput
                                style={styles.input}
                                placeholder="Enter layer title"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={layerTitle}
                                onChangeText={setLayerTitle}
                            />

                            {/* Choices */}
                            {choices.map((choice, index) => (
                                <View key={choice.id} style={styles.choiceRow}>
                                    <TextInput
                                        style={styles.choiceInput}
                                        placeholder={`Choice ${index + 1}`}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={choice.text}
                                        onChangeText={(text) => handleUpdateChoice(index, text)}
                                    />
                                    {choices.length > 1 && (
                                        <TouchableOpacity onPress={() => handleRemoveChoice(index)}>
                                            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity style={styles.addButton} onPress={handleAddChoice}>
                                <Ionicons name="add" size={16} color="#fff" />
                                <Text style={styles.addButtonText}>Choice</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Recommendations Container */}
                        <View style={styles.recommendationContainer}>
                            <Text style={styles.recommendationTitle}>
                                Layer {layerNumber} - Recommendations
                            </Text>

                            {/* Recommendations */}
                            {recommendations.map((rec, index) => (
                                <View key={rec.id} style={styles.choiceRow}>
                                    <TextInput
                                        style={styles.choiceInput}
                                        placeholder={`Suggestion ${index + 1}`}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={rec.text}
                                        onChangeText={(text) =>
                                            handleUpdateRecommendation(index, text)
                                        }
                                    />
                                    {recommendations.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => handleRemoveRecommendation(index)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleAddRecommendation}
                            >
                                <Ionicons name="add" size={16} color="#fff" />
                                <Text style={styles.addButtonText}>Suggestion</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreateLayer}
                            >
                                <Text style={styles.createButtonText}>Create Layer</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetScrollView>
                </LinearGradient>
            </View>
        </BottomSheetModal>
    );
};

export default AddLayerModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomSheetBackground: {
        backgroundColor: 'transparent',
    },
    handleIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        width: 40,
    },
    gradientContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 60,
    },
    layerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    layerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    choiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    choiceInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        paddingVertical: 10,
        marginTop: 4,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    recommendationContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    recommendationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 30,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    createButton: {
        flex: 1,
        backgroundColor: '#7B3FF2',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

// components/Modals/AddSectionModal.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface AddSectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSectionCreated: (section: any) => void;
    sectionNumber: number;
}

const AddSectionModal: React.FC<AddSectionModalProps> = ({
    visible,
    onClose,
    onSectionCreated,
    sectionNumber,
}) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);

    const [sectionTitle, setSectionTitle] = useState('');
    const [guidelines, setGuidelines] = useState('');
    const [numberOfLayers, setNumberOfLayers] = useState(2);
    const [showLayerDropdown, setShowLayerDropdown] = useState(false);

    // Layer states
    const [layers, setLayers] = useState<Array<{
        id: string;
        title: string;
        choices: Array<{ id: string; text: string }>;
        recommendations: Array<{ id: string; text: string }>;
    }>>([
        {
            id: '1',
            title: 'Assessment Layer',
            choices: [{ id: '1', text: '' }],
            recommendations: [{ id: '1', text: '' }],
        },
        {
            id: '2',
            title: 'Assessment Layer',
            choices: [{ id: '1', text: '' }],
            recommendations: [{ id: '1', text: '' }],
        },
    ]);

    useEffect(() => {
        if (visible) {
            bottomSheetRef.current?.present();
        } else {
            bottomSheetRef.current?.dismiss();
        }
    }, [visible]);

    const handleLayerCountChange = (count: number) => {
        setNumberOfLayers(count);
        setShowLayerDropdown(false);

        // Adjust layers array
        const newLayers = [];
        for (let i = 0; i < count; i++) {
            if (layers[i]) {
                newLayers.push(layers[i]);
            } else {
                newLayers.push({
                    id: `${i + 1}`,
                    title: 'Assessment Layer',
                    choices: [{ id: '1', text: '' }],
                    recommendations: [{ id: '1', text: '' }],
                });
            }
        }
        setLayers(newLayers);
    };

    const handleAddChoice = (layerIndex: number) => {
        const newLayers = [...layers];
        newLayers[layerIndex].choices.push({
            id: Date.now().toString(),
            text: '',
        });
        setLayers(newLayers);
    };

    const handleUpdateChoice = (layerIndex: number, choiceIndex: number, text: string) => {
        const newLayers = [...layers];
        newLayers[layerIndex].choices[choiceIndex].text = text;
        setLayers(newLayers);
    };

    const handleAddRecommendation = (layerIndex: number) => {
        const newLayers = [...layers];
        newLayers[layerIndex].recommendations.push({
            id: Date.now().toString(),
            text: '',
        });
        setLayers(newLayers);
    };

    const handleUpdateRecommendation = (
        layerIndex: number,
        recIndex: number,
        text: string
    ) => {
        const newLayers = [...layers];
        newLayers[layerIndex].recommendations[recIndex].text = text;
        setLayers(newLayers);
    };

    const handleCreateSection = () => {
        // Validate
        if (!sectionTitle.trim()) {
            return;
        }

        // Create section object WITHOUT _id - let parent component handle it
        const newSection: any = {
            title: sectionTitle,
            description: guidelines,
            layers: layers.map((layer) => ({
                title: layer.title,
                choices: layer.choices
                    .filter((c) => c.text.trim().length > 0)
                    .map((c) => ({
                        text: c.text,
                    })),
            })),
        };

        onSectionCreated(newSection);
        resetForm();
    };

    const resetForm = () => {
        setSectionTitle('');
        setGuidelines('');
        setNumberOfLayers(2);
        setLayers([
            {
                id: '1',
                title: 'Assessment Layer',
                choices: [{ id: '1', text: '' }],
                recommendations: [{ id: '1', text: '' }],
            },
            {
                id: '2',
                title: 'Assessment Layer',
                choices: [{ id: '1', text: '' }],
                recommendations: [{ id: '1', text: '' }],
            },
        ]);
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
                        <Text style={styles.modalTitle}>Add Section</Text>
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
                        {/* Section Number */}
                        <Text style={styles.sectionNumberText}>Section {sectionNumber}</Text>

                        {/* Section Name */}
                        <TextInput
                            style={styles.input}
                            placeholder="Name of Section"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={sectionTitle}
                            onChangeText={setSectionTitle}
                        />

                        {/* Guidelines */}
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Guidelines for Section"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={guidelines}
                            onChangeText={setGuidelines}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Number of Layers Dropdown */}
                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownLabel}>Number of Layers : </Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowLayerDropdown(!showLayerDropdown)}
                            >
                                <Text style={styles.dropdownValue}>{numberOfLayers}</Text>
                                <Ionicons
                                    name={showLayerDropdown ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            {showLayerDropdown && (
                                <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <TouchableOpacity
                                            key={num}
                                            style={styles.dropdownItem}
                                            onPress={() => handleLayerCountChange(num)}
                                        >
                                            <Text style={styles.dropdownItemText}>{num}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        {/* Layers */}
                        {layers.map((layer, layerIndex) => (
                            <View key={layer.id} style={styles.layerContainer}>
                                <Text style={styles.layerTitle}>Layer {layerIndex + 1}</Text>

                                {/* Choices */}
                                {layer.choices.map((choice, choiceIndex) => (
                                    <TextInput
                                        key={choice.id}
                                        style={styles.input}
                                        placeholder={`Choice ${choiceIndex + 1}`}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={choice.text}
                                        onChangeText={(text) =>
                                            handleUpdateChoice(layerIndex, choiceIndex, text)
                                        }
                                    />
                                ))}

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => handleAddChoice(layerIndex)}
                                >
                                    <Ionicons name="add" size={16} color="#fff" />
                                    <Text style={styles.addButtonText}>Choice</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Recommendations */}
                        {layers.map((layer, layerIndex) => (
                            <View key={`rec-${layer.id}`} style={styles.recommendationContainer}>
                                <Text style={styles.recommendationTitle}>
                                    Layer {layerIndex + 1} - Recommendations
                                </Text>

                                {layer.recommendations.map((rec, recIndex) => (
                                    <TextInput
                                        key={rec.id}
                                        style={styles.input}
                                        placeholder={`Suggestion ${recIndex + 1}`}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={rec.text}
                                        onChangeText={(text) =>
                                            handleUpdateRecommendation(layerIndex, recIndex, text)
                                        }
                                    />
                                ))}

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => handleAddRecommendation(layerIndex)}
                                >
                                    <Ionicons name="add" size={16} color="#fff" />
                                    <Text style={styles.addButtonText}>Suggestion</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreateSection}
                            >
                                <Text style={styles.createButtonText}>Create Section</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetScrollView>
                </LinearGradient>
            </View>
        </BottomSheetModal>
    );
};

export default AddSectionModal;

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
    sectionNumberText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dropdownContainer: {
        marginBottom: 20,
        zIndex: 1000,
    },
    dropdownLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dropdownValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    dropdownMenu: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        marginTop: 8,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#fff',
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

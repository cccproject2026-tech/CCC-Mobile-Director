import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/ui/design-system';

interface Choice {
    id: string;
    text: string;
}

interface Layer {
    id: string;
    title: string;
    choices: Choice[];
}

interface SectionRecommendationLevel {
    level: 1 | 2 | 3 | 4;
    plans: { id: string; text: string }[];
}

export interface NewSectionPayload {
    title: string;
    description: string;
    layers: {
        title: string;
        choices: { text: string }[];
    }[];
    recommendations: {
        level: 1 | 2 | 3 | 4;
        items: string[];
    }[];
}

interface AddSectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSectionCreated: (section: NewSectionPayload) => void;
    sectionNumber: number;
}

const createDefaultLayers = (count: number): Layer[] =>
    Array.from({ length: count }, (_, index) => ({
        id: `${Date.now()}-${index}`,
        title: '',
        choices: [{ id: `${Date.now()}-choice-${index}`, text: '' }],
    }));

const createDefaultRecommendations = (): SectionRecommendationLevel[] => {
    const timestamp = Date.now();
    return [1, 2, 3, 4].map((level) => ({
        level: level as 1 | 2 | 3 | 4,
        plans: [{ id: `${timestamp}-${level}-1`, text: '' }],
    }));
};

const AddSectionModal: React.FC<AddSectionModalProps> = ({
    visible,
    onClose,
    onSectionCreated,
    sectionNumber,
}) => {
    const { top, bottom } = useSafeAreaInsets();
    const [sectionTitle, setSectionTitle] = useState('');
    const [guidelines, setGuidelines] = useState('');
    const [layers, setLayers] = useState<Layer[]>(() => createDefaultLayers(2));
    const [recommendations, setRecommendations] = useState<SectionRecommendationLevel[]>(
        createDefaultRecommendations,
    );

    useEffect(() => {
        if (!visible) return;
        setSectionTitle('');
        setGuidelines('');
        setLayers(createDefaultLayers(2));
        setRecommendations(createDefaultRecommendations());
    }, [visible]);

    const updateLayerCount = (count: number) => {
        setLayers((prev) => {
            const next: Layer[] = [];
            for (let i = 0; i < count; i++) {
                next.push(
                    prev[i] ?? {
                        id: `${Date.now()}-${i}`,
                        title: '',
                        choices: [{ id: `${Date.now()}-choice-${i}`, text: '' }],
                    },
                );
            }
            return next;
        });
    };

    const addChoice = (layerId: string) => {
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === layerId
                    ? {
                          ...layer,
                          choices: [
                              ...layer.choices,
                              { id: Date.now().toString(), text: '' },
                          ],
                      }
                    : layer,
            ),
        );
    };

    const removeChoice = (layerId: string, choiceId: string) => {
        setLayers((prev) =>
            prev.map((layer) => {
                if (layer.id !== layerId || layer.choices.length <= 1) return layer;
                return {
                    ...layer,
                    choices: layer.choices.filter((choice) => choice.id !== choiceId),
                };
            }),
        );
    };

    const updateChoice = (layerId: string, choiceId: string, text: string) => {
        setLayers((prev) =>
            prev.map((layer) =>
                layer.id === layerId
                    ? {
                          ...layer,
                          choices: layer.choices.map((choice) =>
                              choice.id === choiceId ? { ...choice, text } : choice,
                          ),
                      }
                    : layer,
            ),
        );
    };

    const addSectionPlan = (level: 1 | 2 | 3 | 4) => {
        setRecommendations((prev) =>
            prev.map((rec) =>
                rec.level === level
                    ? {
                          ...rec,
                          plans: [...rec.plans, { id: Date.now().toString(), text: '' }],
                      }
                    : rec,
            ),
        );
    };

    const removeSectionPlan = (level: 1 | 2 | 3 | 4, planId: string) => {
        setRecommendations((prev) =>
            prev.map((rec) => {
                if (rec.level !== level || rec.plans.length <= 1) return rec;
                return {
                    ...rec,
                    plans: rec.plans.filter((plan) => plan.id !== planId),
                };
            }),
        );
    };

    const updateSectionPlan = (level: 1 | 2 | 3 | 4, planId: string, text: string) => {
        setRecommendations((prev) =>
            prev.map((rec) =>
                rec.level === level
                    ? {
                          ...rec,
                          plans: rec.plans.map((plan) =>
                              plan.id === planId ? { ...plan, text } : plan,
                          ),
                      }
                    : rec,
            ),
        );
    };

    const handleCreateSection = () => {
        if (!sectionTitle.trim()) {
            Alert.alert('Validation Error', 'Please enter a section name.');
            return;
        }

        const payload: NewSectionPayload = {
            title: sectionTitle.trim(),
            description: guidelines.trim() || 'No guidelines provided',
            layers: layers.map((layer, layerIndex) => ({
                title: layer.title.trim() || `Layer ${layerIndex + 1}`,
                choices: layer.choices.map((choice) => ({ text: choice.text })),
            })),
            recommendations: recommendations.map((rec) => ({
                level: rec.level,
                items: rec.plans.map((plan) => plan.text.trim()).filter(Boolean),
            })),
        };

        onSectionCreated(payload);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <GradientBackground>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={[styles.header, { paddingTop: top + 8 }]}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add Section</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: bottom + 24 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.sectionBox}>
                            <Text style={styles.sectionTitle}>Section {sectionNumber}</Text>

                            <TextInput
                                style={styles.inputBox}
                                placeholder={`Name of Section ${sectionNumber}`}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={sectionTitle}
                                onChangeText={setSectionTitle}
                            />

                            <TextInput
                                style={[styles.inputBox, styles.textArea]}
                                placeholder={`Guidelines for Section ${sectionNumber}`}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={guidelines}
                                onChangeText={setGuidelines}
                                multiline
                                numberOfLines={3}
                            />

                            <View style={styles.layerCountContainer}>
                                <Text style={styles.layerCountLabel}>Number of Layers:</Text>
                                <View style={styles.layerCountControls}>
                                    <TouchableOpacity
                                        style={[
                                            styles.layerCountButton,
                                            layers.length <= 1 && styles.layerCountButtonDisabled,
                                        ]}
                                        onPress={() => {
                                            if (layers.length > 1) {
                                                updateLayerCount(layers.length - 1);
                                            }
                                        }}
                                        disabled={layers.length <= 1}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={20}
                                            color={
                                                layers.length <= 1
                                                    ? 'rgba(255,255,255,0.3)'
                                                    : '#FFFFFF'
                                            }
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.layerCountDisplay}>
                                        <Text style={styles.layerCountText}>{layers.length}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.layerCountButton}
                                        onPress={() => updateLayerCount(layers.length + 1)}
                                    >
                                        <Ionicons name="add" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {layers.map((layer, layerIndex) => (
                                <View key={layer.id} style={styles.layerBox}>
                                    <Text style={styles.layerTitle}>Layer {layerIndex + 1}</Text>
                                    <Text style={styles.layerFieldLabel}>Choices</Text>

                                    {layer.choices.map((choice, choiceIndex) => (
                                        <View key={choice.id} style={styles.choiceRow}>
                                            <TextInput
                                                style={[styles.inputBox, styles.choiceInput]}
                                                placeholder={`Choice ${choiceIndex + 1}`}
                                                placeholderTextColor="rgba(255,255,255,0.5)"
                                                value={choice.text}
                                                onChangeText={(text) =>
                                                    updateChoice(layer.id, choice.id, text)
                                                }
                                            />
                                            {layer.choices.length > 1 && (
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() =>
                                                        removeChoice(layer.id, choice.id)
                                                    }
                                                >
                                                    <Ionicons
                                                        name="close-circle"
                                                        size={24}
                                                        color="#FF6B6B"
                                                    />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}

                                    <TouchableOpacity
                                        style={styles.addBtn}
                                        onPress={() => addChoice(layer.id)}
                                    >
                                        <Ionicons name="add" size={16} color="#FFF" />
                                        <Text style={styles.addBtnText}>Add Choice</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <View style={styles.cdpSection}>
                                <Text style={styles.cdpSectionTitle}>
                                    Customized Development Plans (this section)
                                </Text>

                                {recommendations.map((rec) => (
                                    <View key={rec.level} style={styles.cdpLevelContainer}>
                                        <Text style={styles.cdpLevelTitle}>
                                            Level {rec.level} - Customized Development Plans
                                        </Text>

                                        {rec.plans.map((plan, index) => (
                                            <View key={plan.id} style={styles.planRow}>
                                                <TextInput
                                                    style={[styles.inputBox, styles.choiceInput]}
                                                    placeholder={`Plan ${index + 1}`}
                                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                                    value={plan.text}
                                                    onChangeText={(text) =>
                                                        updateSectionPlan(rec.level, plan.id, text)
                                                    }
                                                />
                                                {rec.plans.length > 1 && (
                                                    <TouchableOpacity
                                                        style={styles.removeButton}
                                                        onPress={() =>
                                                            removeSectionPlan(rec.level, plan.id)
                                                        }
                                                    >
                                                        <Ionicons
                                                            name="close-circle"
                                                            size={24}
                                                            color="#FF6B6B"
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}

                                        {rec.plans.length < 8 && (
                                            <TouchableOpacity
                                                style={styles.addBtn}
                                                onPress={() => addSectionPlan(rec.level)}
                                            >
                                                <Ionicons name="add" size={16} color="#FFF" />
                                                <Text style={styles.addBtnText}>Plan</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreateSection}
                            >
                                <Text style={styles.createButtonText}>Add Section</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </GradientBackground>
        </Modal>
    );
};

export default AddSectionModal;

const styles = StyleSheet.create({
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    headerSpacer: { width: 40 },
    scrollContent: {
        padding: 16,
    },
    sectionBox: {
        backgroundColor: 'rgba(21, 92, 147, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    inputBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 12,
    },
    textArea: {
        minHeight: 90,
        textAlignVertical: 'top',
    },
    choiceInput: {
        flex: 1,
        marginBottom: 0,
    },
    layerCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    layerCountLabel: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '500',
    },
    layerCountControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    layerCountButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    layerCountButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    layerCountDisplay: {
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    layerCountText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    layerBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    layerTitle: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    layerFieldLabel: {
        color: '#E2E8F0',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    choiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
        paddingVertical: 8,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    cdpSection: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    cdpSectionTitle: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    cdpLevelContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 12,
    },
    cdpLevelTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
    },
    planRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    removeButton: {
        padding: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
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

// components/Cards/SectionCard.tsx
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiAssessmentSection } from '@/types/assessment.types';

interface SectionCardProps {
    section: ApiAssessmentSection;
    sectionIndex: number;
    sections: ApiAssessmentSection[];
    setSections: (sections: ApiAssessmentSection[]) => void;
    onAddLayer: () => void;
    onOpenRecommendations: (layerIndex: number) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
    section,
    sectionIndex,
    sections,
    setSections,
    onAddLayer,
    onOpenRecommendations,
}) => {
    const handleUpdateSectionTitle = (text: string) => {
        const updated = [...sections];
        updated[sectionIndex].title = text;
        setSections(updated);
    };

    const handleUpdateSectionDescription = (text: string) => {
        const updated = [...sections];
        updated[sectionIndex].description = text;
        setSections(updated);
    };

    const handleUpdateLayerTitle = (layerIndex: number, text: string) => {
        const updated = [...sections];
        updated[sectionIndex].layers[layerIndex].title = text;
        setSections(updated);
    };

    const handleUpdateChoice = (layerIndex: number, choiceIndex: number, text: string) => {
        const updated = [...sections];
        updated[sectionIndex].layers[layerIndex].choices[choiceIndex].text = text;
        setSections(updated);
    };

    const handleAddChoice = (layerIndex: number) => {
        const updated = [...sections];
        const newChoice = {
            text: '',
            _id: `temp-choice-${Date.now()}`,
        };
        updated[sectionIndex].layers[layerIndex].choices.push(newChoice);
        setSections(updated);
    };

    return (
        <View style={styles.sectionContainer}>
            {/* Section Title Box */}
            <View style={styles.sectionTitleBox}>
                <TextInput
                    style={styles.sectionTitleInput}
                    value={section.title}
                    onChangeText={handleUpdateSectionTitle}
                    placeholder="Personal Well-Being"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                />
            </View>

            {/* Section Description */}
            <Text style={styles.sectionDescription}>
                {section.description || 'Choose the option that best matches how you feel and who you are. This self-assessment helps you understand yourself better. Your accuracy allows us to provide the best support and guidance.'}
            </Text>

            {/* Select and Layer Buttons */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Select</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={onAddLayer}>
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Layer</Text>
                </TouchableOpacity>
            </View>

            {/* Layers */}
            {section.layers.map((layer, layerIndex) => (
                <View key={layer._id} style={styles.layerCard}>
                    {/* Layer Header */}
                    <View style={styles.layerHeader}>
                        <View style={styles.layerTitleRow}>
                            <Text style={styles.layerNumber}>{layerIndex + 1}</Text>
                            <TextInput
                                style={styles.layerTitleInput}
                                value={layer.title}
                                onChangeText={(text) => handleUpdateLayerTitle(layerIndex, text)}
                                placeholder="Feeling physically drained most of the time."
                                placeholderTextColor="rgba(255,255,255,0.5)"
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => onOpenRecommendations(layerIndex)}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Choices */}
                    {layer.choices.map((choice, choiceIndex) => (
                        <View key={choice._id} style={styles.choiceItem}>
                            <Text style={styles.choiceNumber}>{choiceIndex + 1}</Text>
                            <TextInput
                                style={styles.choiceInput}
                                value={choice.text}
                                onChangeText={(text) =>
                                    handleUpdateChoice(layerIndex, choiceIndex, text)
                                }
                                placeholder={`Choice ${choiceIndex + 1}`}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                            />
                        </View>
                    ))}

                    {/* Add Choice Button */}
                    <TouchableOpacity
                        style={styles.addChoiceButton}
                        onPress={() => handleAddChoice(layerIndex)}
                    >
                        <Ionicons name="add" size={16} color="#fff" />
                        <Text style={styles.addChoiceText}>Choice</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

export default SectionCard;

const styles = StyleSheet.create({
    sectionContainer: {
        backgroundColor: 'rgba(30, 60, 120, 0.4)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    sectionTitleBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionTitleInput: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        padding: 0,
    },
    sectionDescription: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    layerCard: {
        backgroundColor: 'rgba(20, 50, 100, 0.5)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    layerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    layerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    layerNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        minWidth: 20,
    },
    layerTitleInput: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        padding: 0,
    },
    menuButton: {
        padding: 4,
    },
    choiceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    choiceNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
        minWidth: 20,
    },
    choiceInput: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        padding: 0,
    },
    addChoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        marginTop: 4,
    },
    addChoiceText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
});

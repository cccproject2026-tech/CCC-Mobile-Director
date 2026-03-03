// app/(director)/(tabs)/assessments/edit-sections.tsx
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '@/components/Header/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAssessment, useUpdateSectionsMutation } from '@/hooks/useAssessments';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ApiAssessmentSection } from '@/types/assessment.types';
import AddSectionModal from '@/components/Modals/AddSectionModal';
import AddLayerModal from '@/components/Modals/AddLayerModal';
import RecommendationsModal from '@/components/Modals/RecommendationsModal';

const EditSections = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: assessment, isLoading, error } = useAssessment(id);
    const updateMutation = useUpdateSectionsMutation(id!);

    const [sections, setSections] = useState<ApiAssessmentSection[]>([]);
    const [originalSections, setOriginalSections] = useState<ApiAssessmentSection[]>([]);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    const [addSectionModalVisible, setAddSectionModalVisible] = useState(false);
    const [addLayerModalVisible, setAddLayerModalVisible] = useState(false);
    const [recommendationsModalVisible, setRecommendationsModalVisible] = useState(false);
    const [selectedLayerIndex, setSelectedLayerIndex] = useState<number | null>(null);

    useEffect(() => {
        if (assessment) {
            setSections(assessment.sections);
            setOriginalSections(JSON.parse(JSON.stringify(assessment.sections)));
        }
    }, [assessment]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(sections) !== JSON.stringify(originalSections);
    }, [sections, originalSections]);

    const currentSection = sections[currentSectionIndex];

    const handleAddSection = (newSection: any) => {
        const sectionWithTempId = {
            ...newSection,
            _id: `temp-${Date.now()}`,
            layers: newSection.layers.map((layer: any, idx: number) => ({
                ...layer,
                _id: `temp-layer-${Date.now()}-${idx}`,
                choices: layer.choices.map((choice: any, cIdx: number) => ({
                    ...choice,
                    _id: `temp-choice-${Date.now()}-${idx}-${cIdx}`,
                })),
            })),
        };
        setSections([...sections, sectionWithTempId]);
        setAddSectionModalVisible(false);
        setCurrentSectionIndex(sections.length);
    };

    const handleAddLayer = () => {
        setAddLayerModalVisible(true);
    };

    const handleLayerCreated = (layer: any) => {
        const updatedSections = [...sections];
        const layerWithTempId = {
            ...layer,
            title: 'Assessment Layer',
            _id: `temp-layer-${Date.now()}`,
            choices: layer.choices.map((choice: any, idx: number) => ({
                ...choice,
                _id: `temp-choice-${Date.now()}-${idx}`,
            })),
        };
        updatedSections[currentSectionIndex].layers.push(layerWithTempId);
        setSections(updatedSections);
        setAddLayerModalVisible(false);
    };

    const handleOpenRecommendations = (layerIndex: number) => {
        setSelectedLayerIndex(layerIndex);
        setRecommendationsModalVisible(true);
    };

    const handleSaveRecommendations = (recommendations: string[]) => {
        if (selectedLayerIndex !== null) {
            const updatedSections = [...sections];
            updatedSections[currentSectionIndex].layers[selectedLayerIndex].recommendations = recommendations;
            setSections(updatedSections);
            setRecommendationsModalVisible(false);
            setSelectedLayerIndex(null);
        }
    };

    const handleUpdateSectionTitle = (text: string) => {
        const updated = [...sections];
        updated[currentSectionIndex].title = text;
        setSections(updated);
    };

    const handleUpdateSectionDescription = (text: string) => {
        const updated = [...sections];
        updated[currentSectionIndex].description = text;
        setSections(updated);
    };

    const handleUpdateChoice = (layerIndex: number, choiceIndex: number, text: string) => {
        const updated = [...sections];
        updated[currentSectionIndex].layers[layerIndex].choices[choiceIndex].text = text;
        setSections(updated);
    };

    const handleAddChoice = (layerIndex: number) => {
        const updated = [...sections];
        const newChoice = {
            text: '',
            _id: `temp-choice-${Date.now()}`,
        };
        updated[currentSectionIndex].layers[layerIndex].choices.push(newChoice);
        setSections(updated);
    };

    const handleDeleteChoice = (layerIndex: number, choiceIndex: number) => {
        const updated = [...sections];
        updated[currentSectionIndex].layers[layerIndex].choices.splice(choiceIndex, 1);
        setSections(updated);
    };

    const handleSaveChanges = async () => {
        try {
            const cleanedSections = sections.map(section => ({
                title: section.title,
                description: section.description,
                layers: section.layers.map(layer => ({
                    title: layer.title,
                    choices: layer.choices.map(choice => ({
                        text: choice.text,
                    })),
                    recommendations: layer.recommendations || [],
                })),
            }));

            console.log('Sending to API:', JSON.stringify({ sections: cleanedSections }, null, 2));

            await updateMutation.mutateAsync(cleanedSections as any);

            setOriginalSections(JSON.parse(JSON.stringify(sections)));
            Alert.alert('Success', 'Sections updated successfully!');
        } catch (err) {
            console.error('Failed to update sections:', err);
            Alert.alert('Error', 'Failed to update sections. Please try again.');
        }
    };

    const handleCancel = () => {
        setSections(JSON.parse(JSON.stringify(originalSections)));
    };

    const handleEditNext = () => {
        if (currentSectionIndex < sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        } else {
            if (hasChanges) {
                Alert.alert(
                    'Save Changes',
                    'Do you want to save your changes?',
                    [
                        {
                            text: 'Discard',
                            style: 'destructive',
                            onPress: () => {
                                console.log('Navigate to next page');
                            },
                        },
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Save',
                            onPress: async () => {
                                await handleSaveChanges();
                                console.log('Navigate to next page');
                            },
                        },
                    ]
                );
            } else {
                console.log('Navigate to next page');
            }
        }
    };

    const handleEditBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    const handleSectionDotPress = (index: number) => {
        setCurrentSectionIndex(index);
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#1B5F8C', '#1D548D', '#264387']} style={styles.container}>
                <TopBar showUserName={true} showNotifications={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading sections...</Text>
                </View>
            </LinearGradient>
        );
    }

    if (error || !assessment || !currentSection) {
        return (
            <LinearGradient colors={['#1B5F8C', '#1D548D', '#264387']} style={styles.container}>
                <TopBar showUserName={true} showNotifications={true} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text style={styles.errorText}>Failed to load assessment</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <BottomSheetModalProvider>
                <LinearGradient colors={['#1B5F8C', '#1D548D', '#264387']} style={styles.container}>
                    <TopBar showUserName={true} showNotifications={true} />

                    {/* Header */}
                    <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            Church Assessment Evaluation(CMA)
                        </Text>
                        <Text style={styles.headerSubtitle}>Assessment</Text>
                    </View>
                </View>

                {/* Section Progress Dots */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeaderRow}>
                        <View style={styles.stepsWrapper}>
                            {/* Only show the line if there is more than 1 section */}
                            {sections.length > 1 && <View style={styles.stepConnectorLine} />}

                            <View style={[
                                styles.dotsRow,
                                sections.length === 1 && { justifyContent: 'flex-start' } // Align single dot to left
                            ]}>
                                {sections.map((section, index) => (
                                    <TouchableOpacity
                                        key={section._id}
                                        onPress={() => handleSectionDotPress(index)}
                                    >
                                        <View
                                            style={[
                                                styles.progressDot,
                                                index === currentSectionIndex && styles.progressDotActive,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.addSectionButton}
                            onPress={() => setAddSectionModalVisible(true)}
                        >
                            <Ionicons name="add" size={16} color="#fff" />
                            <Text style={styles.addSectionText}>Section</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom, flexGrow: 1 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >


                    {/* Section Title Box */}
                    <View style={styles.sectionTitleBox}>
                        <View style={styles.sectionLabelContainer}>
                            <View style={styles.sectionLabelBadge}>
                                <Text style={styles.sectionLabelText}>Section {currentSectionIndex + 1}</Text>
                            </View>
                        </View>
                        <TextInput
                            style={styles.sectionTitleInput}
                            value={currentSection.title}
                            onChangeText={handleUpdateSectionTitle}
                            placeholder="Personal Well-Being"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                        />
                    </View>

                    {/* Section Description Container */}
                    <View style={styles.descriptionContainer}>
                        <TextInput
                            style={styles.descriptionInput}
                            value={currentSection.description}
                            onChangeText={handleUpdateSectionDescription}
                            placeholder="Choose the option that best matches how you feel and who you are. This brief self-assessment helps us understand yourself better. Your accuracy allows us to provide the best support and guidance."
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                            multiline
                        />
                    </View>

                    {/* Select and Layer Buttons */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Ionicons name="checkmark-outline" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Select</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={handleAddLayer}>
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Layer</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Layers */}
                    {currentSection.layers.map((layer, layerIndex) => (
                        <View key={layer._id} style={styles.layerContainer}>
                            {/* Layer Header with Three Dots */}
                            <View style={styles.layerHeaderRow}>
                                <View style={styles.layerTitleContainer}>
                                    <Text style={styles.layerNumber}>{layerIndex + 1}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.menuButton}
                                    onPress={() => handleOpenRecommendations(layerIndex)}
                                >
                                    <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Choices List */}
                            {layer.choices.map((choice, choiceIndex) => (
                                <View key={choice._id} style={styles.choiceRow}>
                                    <Text style={styles.choiceNumber}>{choiceIndex + 1}</Text>
                                    <TextInput
                                        style={styles.choiceInput}
                                        value={choice.text}
                                        onChangeText={(text) =>
                                            handleUpdateChoice(layerIndex, choiceIndex, text)
                                        }
                                        placeholder={`Choice ${choiceIndex + 1}`}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        multiline
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
                    <View style={[styles.bottomContainer]}>
                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    !hasChanges && styles.saveButtonDisabled,
                                ]}
                                onPress={handleSaveChanges}
                                disabled={!hasChanges || updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.saveButtonText,
                                            !hasChanges && styles.saveButtonTextDisabled,
                                        ]}
                                    >
                                        Save Changes
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.editNextContainer}>
                            {/* Show Back button if not on the first section */}
                            {currentSectionIndex > 0 && (
                                <LinearGradient
                                    colors={['#6366F1', '#38BDF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.editNextGradient, { marginRight: 10 }]}
                                >
                                    <TouchableOpacity style={styles.editNextButton} onPress={handleEditBack}>
                                        <Text style={styles.editNextButtonText}>&lt;&lt; Back</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            )}

                            {/* Show Edit Next if there's another section ahead */}
                            {currentSectionIndex < sections.length - 1 && (
                                <LinearGradient
                                    colors={['#6366F1', '#38BDF8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.editNextGradient}
                                >
                                    <TouchableOpacity style={styles.editNextButton} onPress={handleEditNext}>
                                        <Text style={styles.editNextButtonText}>Edit Next &gt;&gt;</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            )}
                        </View>
                    </View>
                </ScrollView>

                {/* Fixed Bottom Buttons */}


                {/* Modals */}
                <AddSectionModal
                    visible={addSectionModalVisible}
                    onClose={() => setAddSectionModalVisible(false)}
                    onSectionCreated={handleAddSection}
                    sectionNumber={sections.length + 1}
                />

                <AddLayerModal
                    visible={addLayerModalVisible}
                    onClose={() => setAddLayerModalVisible(false)}
                    onLayerCreated={handleLayerCreated}
                    layerNumber={currentSection.layers.length + 1}
                />

                <RecommendationsModal
                    visible={recommendationsModalVisible}
                    onClose={() => {
                        setRecommendationsModalVisible(false);
                        setSelectedLayerIndex(null);
                    }}
                    layerNumber={selectedLayerIndex !== null ? selectedLayerIndex + 1 : 1}
                    layerTitle={
                        selectedLayerIndex !== null
                            ? currentSection.layers[selectedLayerIndex].title
                            : ''
                    }
                    initialRecommendations={
                        selectedLayerIndex !== null
                            ? currentSection.layers[selectedLayerIndex].recommendations || []
                            : []
                    }
                    onSave={handleSaveRecommendations}
                />
                </LinearGradient>
            </BottomSheetModalProvider>
        </KeyboardAvoidingView>
    );
};

export default EditSections;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerBackButton: {
        marginRight: 8,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    progressContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    progressHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepsWrapper: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 20,
        height: 30,
    },
    stepConnectorLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginTop: -1, // Centers the line perfectly
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Spreads dots evenly across the line
    },
    dotTouchArea: {
        padding: 5,
        zIndex: 1,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1E3A8A', // Dark blue from image
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressDotActive: {
        backgroundColor: '#FFFFFF',
        width: 14,
        height: 14,
        borderRadius: 7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    progressDotCompleted: {
        backgroundColor: '#FFFFFF',
        opacity: 0.8,
    },
    addSectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    addSectionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    sectionLabelContainer: {
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 4,
    },
    sectionLabelBadge: {
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    sectionLabelText: {
        fontSize: 12,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    sectionTitleBox: {
        backgroundColor: 'rgba(30, 80, 120, 0.4)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionTitleInput: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        padding: 0,
    },
    descriptionContainer: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        padding: 0,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignSelf: 'stretch',
    },
    descriptionInput: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 18,
        textAlign: 'left',
        padding: 0,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
        width: '60%',
        alignSelf: 'flex-end'
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
        backgroundColor: 'rgba(30, 80, 120, 0.3)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    layerContainer: {
        backgroundColor: 'rgba(30, 60, 100, 0.35)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    layerHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    layerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        paddingRight: 12,
    },
    layerNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        minWidth: 24,
        marginTop: 2,
    },
    layerTitleInput: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        padding: 0,
        fontWeight: '500',
        lineHeight: 20,
    },
    menuButton: {
        padding: 4,
    },
    choiceRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(20, 40, 80, 0.4)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    choiceNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
        minWidth: 24,
        marginTop: 2,
    },
    choiceInput: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        padding: 0,
        lineHeight: 20,
    },
    addChoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingVertical: 10,
        marginTop: 4,
        backgroundColor: 'transparent',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'dashed',
    },
    addChoiceText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
    bottomContainer: {
        // backgroundColor: 'rgba(15, 30, 70, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
        width: '80%',
        alignSelf: 'center'
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        paddingVertical: 13,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    saveButton: {
        flex: 1,
        backgroundColor: 'rgba(40, 60, 100, 0.8)',
        paddingVertical: 13,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        minHeight: 46,
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(40, 60, 100, 0.4)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    saveButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    editNextContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    editNextGradient: {
        borderRadius: 24,
        padding: 1,
        width: '45%',
    },
    editNextButton: {
        backgroundColor: '#264387', // Very dark blue/black background
        paddingVertical: 10,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editNextButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    backButton: {
        marginTop: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
// app/(director)/(tabs)/assessments/[id].tsx
import {
    ActivityIndicator,
    Alert,
    Image,
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
import { GradientBackground } from '@/components/ui/design-system';
import TopBar from '@/components/Header/TopBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAssessment, useUpdateAssessmentMutation } from '@/hooks/useAssessments';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
const AssessmentDetail = () => {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Fetch assessment
    const { data: assessment, isLoading, error } = useAssessment(id);

    // Using the generic update mutation instead of just instructions
    const updateMutation = useUpdateAssessmentMutation(id!);

    // Local state for all editable fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState<string[]>([]);

    // Original data state for change tracking and cancellation
    const [originalData, setOriginalData] = useState({
        name: '',
        description: '',
        instructions: [] as string[]
    });

    const [selectedInstructions, setSelectedInstructions] = useState<Set<number>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Initialize all local states when assessment loads
    useEffect(() => {
        if (assessment) {
            setName(assessment.name);
            setDescription(assessment.description);
            setInstructions(assessment.instructions);
            setOriginalData({
                name: assessment.name,
                description: assessment.description,
                instructions: assessment.instructions
            });
        }
    }, [assessment]);

    // Enhanced hasChanges logic covering Name, Description, and Instructions
    const hasChanges = useMemo(() => {
        const nameChanged = name !== originalData.name;
        const descChanged = description !== originalData.description;
        const instChanged = JSON.stringify(instructions) !== JSON.stringify(originalData.instructions);

        return nameChanged || descChanged || instChanged;
    }, [name, description, instructions, originalData]);

    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedInstructions(new Set());
    };

    const handleToggleInstructionSelection = (index: number) => {
        setSelectedInstructions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = () => {
        if (selectedInstructions.size === 0) {
            Alert.alert('No Selection', 'Please select instructions to delete.');
            return;
        }

        Alert.alert(
            'Delete Instructions',
            `Are you sure you want to delete ${selectedInstructions.size} instruction(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedInstructions = instructions.filter(
                            (_, index) => !selectedInstructions.has(index)
                        );

                        try {
                            // Update via generic mutation
                            await updateMutation.mutateAsync({
                                name,
                                description,
                                instructions: updatedInstructions
                            });

                            setInstructions(updatedInstructions);
                            setOriginalData(prev => ({ ...prev, instructions: updatedInstructions }));
                            setSelectedInstructions(new Set());
                            setIsSelectionMode(false);

                            Alert.alert('Success', 'Instructions deleted successfully!');
                        } catch (err) {
                            console.error('Failed to delete instructions:', err);
                            Alert.alert('Error', 'Failed to delete instructions.');
                        }
                    },
                },
            ]
        );
    };

    const handleAddInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const handleUpdateInstruction = (index: number, text: string) => {
        const updated = [...instructions];
        updated[index] = text;
        setInstructions(updated);
    };

    const handleSaveChanges = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Assessment name cannot be empty.');
            return;
        }

        const validInstructions = instructions.filter((inst) => inst.trim().length > 0);

        try {
            await updateMutation.mutateAsync({
                name: name.trim(),
                description: description.trim(),
                instructions: validInstructions,
            });

            // Update original data to match current saved state
            setOriginalData({
                name: name.trim(),
                description: description.trim(),
                instructions: validInstructions
            });

            Alert.alert('Success', 'Assessment updated successfully!');
        } catch (err) {
            console.error('Failed to save assessment:', err);
            Alert.alert('Error', 'Failed to save changes. Please try again.');
        }
    };

    const handleCancel = () => {
        setName(originalData.name);
        setDescription(originalData.description);
        setInstructions(originalData.instructions);
        setIsSelectionMode(false);
        setSelectedInstructions(new Set());
    };

    const handleEditSections = () => {
        if (hasChanges) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to save before editing sections?',
                [
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            router.push({
                                pathname: '/(director)/(tabs)/assessments/edit-sections',
                                params: { id },
                            });
                        },
                    },
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Save',
                        onPress: async () => {
                            await handleSaveChanges();
                            router.push({
                                pathname: '/(director)/(tabs)/assessments/edit-sections',
                                params: { id },
                            });
                        },
                    },
                ]
            );
        } else {
            router.push({
                pathname: '/(director)/(tabs)/assessments/edit-sections',
                params: { id },
            });
        }
    };

    if (isLoading) {
        return (
            <GradientBackground>
                <TopBar showUserName={true} showNotifications={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading assessment...</Text>
                </View>
            </GradientBackground>
        );
    }

    if (error || !assessment) {
        return (
            <GradientBackground>
                <TopBar showUserName={true} showNotifications={true} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.errorText}>Failed to load assessment</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </GradientBackground>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <GradientBackground>
                <TopBar showUserName={true} showNotifications={true} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                        <View style={styles.backIconWrap}>
                            <Ionicons name="chevron-back" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {isSelectionMode ? `${selectedInstructions.size} Selected` : name}
                        </Text>
                        {!isSelectionMode && <Text style={styles.headerSubtitle}>Assessment</Text>}
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20, flexGrow: 1 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                {/* Hero Image with Editable Title Overlay */}
                <View style={styles.heroContainer}>
                    <Image
                        source={assessment.bannerImage ? { uri: assessment.bannerImage } : require('@/assets/images/app/jumpstart.png')}
                        style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                        <TextInput
                            style={styles.heroTitleInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Assessment Name"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                            blurOnSubmit={true}
                            editable={!isSelectionMode}
                        />
                    </View>
                </View>

                {/* Editable Description */}
                <View style={styles.descriptionContainer}>
                    <TextInput
                        style={styles.descriptionInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Enter assessment description..."
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        multiline
                        editable={!isSelectionMode}
                    />
                </View>

                {/* Assessment Instructions */}
                <View style={styles.instructionsContainer}>
                    <View style={styles.instructionsHeader}>
                        <Text style={styles.instructionsTitle}>Assessment Instructions</Text>
                        <TouchableOpacity onPress={handleToggleSelectionMode}>
                            <Ionicons
                                name={isSelectionMode ? 'close-circle' : 'checkmark-circle-outline'}
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.instructionsList}>
                        {instructions.map((instruction, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.instructionItem,
                                    selectedInstructions.has(index) && styles.instructionItemSelected,
                                ]}
                                onPress={() =>
                                    isSelectionMode && handleToggleInstructionSelection(index)
                                }
                                disabled={!isSelectionMode}
                                activeOpacity={isSelectionMode ? 0.7 : 1}
                            >
                                {isSelectionMode && (
                                    <View
                                        style={[
                                            styles.checkbox,
                                            selectedInstructions.has(index) && styles.checkboxSelected,
                                        ]}
                                    >
                                        {selectedInstructions.has(index) && (
                                            <Ionicons name="checkmark" size={16} color="#1A4882" />
                                        )}
                                    </View>
                                )}
                                <View style={styles.bullet} />
                                <TextInput
                                    style={styles.instructionText}
                                    value={instruction}
                                    onChangeText={(text) => handleUpdateInstruction(index, text)}
                                    placeholder={`Instruction ${index + 1}`}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                    editable={!isSelectionMode}
                                />
                            </TouchableOpacity>
                        ))}

                        {!isSelectionMode && (
                            <TouchableOpacity
                                style={styles.addInstructionButton}
                                onPress={handleAddInstruction}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                <Text style={styles.addInstructionText}>+ Instruction</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Delete Button - Only in Selection Mode */}
                {isSelectionMode && selectedInstructions.size > 0 && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteSelected}
                    >
                        <Ionicons name="trash-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                )}

                {/* Action Buttons */}
                {!isSelectionMode && (
                    <>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    !hasChanges && styles.saveButtonDisabled
                                ]}
                                onPress={handleSaveChanges}
                                disabled={!hasChanges || updateMutation.isPending}
                            >
                                {updateMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={[
                                        styles.saveButtonText,
                                        !hasChanges && styles.saveButtonTextDisabled
                                    ]}>
                                        Save Changes
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Edit Sections Button */}
                        <View style={styles.editSectionsWrapper}>
                            <TouchableOpacity
                                style={styles.editSectionsButton}
                                onPress={handleEditSections}
                            >
                                <Text style={styles.editSectionsButtonText}>Edit Sections {'>>'}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
                </ScrollView>
            </GradientBackground>
        </KeyboardAvoidingView>
    );
};

export default AssessmentDetail;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    headerBackButton: { marginRight: 10 },
    backIconWrap: {
        width: 34, height: 34, borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitleContainer: { flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.2 },
    headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
    heroTitleInput: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        width: '100%',
    },
    descriptionInput: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerBackButton: {
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 16,
    },
    heroContainer: {
        position: 'relative',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    descriptionContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
        textAlign: 'center',
    },
    instructionsContainer: {
        marginHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    instructionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    instructionsList: {
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    instructionItemSelected: {
        backgroundColor: 'rgba(100, 200, 255, 0.2)',
        borderColor: 'rgba(100, 200, 255, 0.5)',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
        padding: 0,
    },
    addInstructionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        marginTop: 8,
    },
    addInstructionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    deleteButton: {
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 107, 107, 0.5)',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '80%',
        alignSelf: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    saveButton: {
        flex: 1,
        backgroundColor: 'rgba(27, 43, 96, 0.8)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minHeight: 48,
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(27, 43, 96, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    saveButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    editSectionsWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '50%',
        alignSelf: 'flex-end',
    },
    editSectionsButton: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    editSectionsButtonText: {
        fontSize: 15,
        fontWeight: '700',
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

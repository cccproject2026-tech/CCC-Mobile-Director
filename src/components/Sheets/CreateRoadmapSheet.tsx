import { useCreateRoadmap } from '@/hooks/roadmap/useRoadmaps';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CreateRoadmapSheetProps {
    onClose: () => void;
    onCancel: () => void;
    onDismissed?: () => void;
    mode?: 'create' | 'edit';
    initialData?: Partial<RoadmapFormData>;
}

export interface RoadmapFormData {
    type: 'single' | 'phase';
    name: string;
    subheading: string;
    completionTime: string;
    divisions: string[];
    bannerImage?: string;
}

const CreateRoadmapSheet = forwardRef<BottomSheetModal, CreateRoadmapSheetProps>(
    ({ onCancel, onDismissed, mode = 'create', initialData }, ref) => {
        const { bottom } = useSafeAreaInsets();
        const router = useRouter();
        const snapPoints = useMemo(() => ['90%'], []);
        const isEditMode = mode === 'edit';

        // React Query mutation
        const createRoadmapMutation = useCreateRoadmap();

        const getInitialFormData = (): RoadmapFormData => {
            if (initialData) {
                return {
                    type: initialData.type || 'single',
                    name: initialData.name || '',
                    subheading: initialData.subheading || '',
                    completionTime: initialData.completionTime || '',
                    divisions: initialData.divisions || [],
                    bannerImage: initialData.bannerImage
                };
            }
            return {
                type: 'single',
                name: '',
                subheading: '',
                completionTime: '',
                divisions: [],
                bannerImage: undefined
            };
        };

        const [formData, setFormData] = useState<RoadmapFormData>(getInitialFormData());
        const [showTypeDropdown, setShowTypeDropdown] = useState(false);
        const [newDivision, setNewDivision] = useState('');

        useEffect(() => {
            if (initialData) {
                setFormData({
                    type: initialData.type || 'single',
                    name: initialData.name || '',
                    subheading: initialData.subheading || '',
                    completionTime: initialData.completionTime || '',
                    divisions: initialData.divisions || [],
                    bannerImage: initialData.bannerImage
                });
            }
        }, [initialData]);

        const resetForm = () => {
            setFormData({
                type: 'single',
                name: '',
                subheading: '',
                completionTime: '',
                divisions: [],
                bannerImage: undefined
            });
            setNewDivision('');
            setShowTypeDropdown(false);
        };

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

        const handleTypeSelect = (type: 'single' | 'phase') => {
            if (isEditMode) return;
            setFormData(prev => ({ ...prev, type }));
            setShowTypeDropdown(false);
        };

        const handleAddDivision = () => {
            if (newDivision.trim()) {
                setFormData(prev => ({
                    ...prev,
                    divisions: [...prev.divisions, newDivision.trim()]
                }));
                setNewDivision('');
            }
        };

        const handleRemoveDivision = (index: number) => {
            setFormData(prev => ({
                ...prev,
                divisions: prev.divisions.filter((_, i) => i !== index)
            }));
        };

        const handleImagePicker = async () => {
            try {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                    setFormData(prev => ({
                        ...prev,
                        bannerImage: result.assets[0].uri
                    }));
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to pick image');
                console.error('Image picker error:', error);
            }
        };

        const validateForm = () => {
            const errors: string[] = [];
            const nameLabel = formData.type === 'phase' ? 'Name of Phase' : 'Roadmap Name';
            const subheadingLabel = formData.type === 'phase' ? 'Name of Subtitle for Phase' : 'Roadmap Subheading';
            const completionLabel = formData.type === 'phase' ? 'Completion Time for the Phase' : 'Completion Time for the Roadmap';

            if (!formData.name.trim()) {
                errors.push(`${nameLabel} is required`);
            }

            if (!formData.subheading.trim()) {
                errors.push(`${subheadingLabel} is required`);
            }

            if (!formData.completionTime.trim()) {
                errors.push(`${completionLabel} is required`);
            }

            // if (formData.type === 'phase' && formData.divisions.length === 0) {
            //     errors.push('At least one division is required for Phase type');
            // }

            return errors;
        };

        const isFormValid = () => {
            return validateForm().length === 0;
        };

        const handleCreate = async () => {
            const validationErrors = validateForm();

            if (validationErrors.length > 0) {
                Alert.alert('Validation Error', validationErrors.join('\n'));
                return;
            }

            try {
                const payload = {
                    type: formData.type === 'phase' ? 'phase' as const : 'single' as const,
                    name: formData.name,
                    roadMapDetails: formData.subheading,
                    duration: formData.completionTime,
                    imageUrl: formData.bannerImage,
                    divisions: formData.divisions.length > 0 ? formData.divisions : ['All'],
                    extras: [],
                    roadmaps: [],
                };

                console.log('📤 Submitting roadmap creation:', payload);

                const response = await createRoadmapMutation.mutateAsync(payload);
                const createdRoadmapId = response.data._id;
                const roadmapType = formData.type;
                const roadmapName = formData.name;

                console.log('✅ Roadmap created with ID:', createdRoadmapId);

                resetForm();
                onCancel();

                // Wait for sheet dismiss to finish before navigating (avoids broken reopen)
                setTimeout(() => {
                    if (roadmapType === 'phase') {
                        router.push({
                            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-creation',
                            params: {
                                roadmapId: createdRoadmapId,
                                type: 'phase',
                                isEditMode: 'false',
                            },
                        } as any);
                    } else {
                        router.push({
                            pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                            params: {
                                roadmapId: createdRoadmapId,
                                name: roadmapName,
                            },
                        } as any);
                    }

                    Alert.alert('Success', 'Roadmap created successfully!');
                }, 350);

            } catch (error: any) {
                console.error('❌ Creation error:', error);
                Alert.alert(
                    'Error',
                    error?.message || 'Failed to create roadmap. Please try again.'
                );
            }
        };

        const handleCancel = () => {
            resetForm();
            onCancel();
        };

        const isLoading = createRoadmapMutation.isPending;

        // Helper function to get display text for type
        const getTypeDisplayText = (type: 'single' | 'phase') => {
            return type === 'phase' ? 'Phase' : 'Single';
        };

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                keyboardBehavior="interactive"
                enablePanDownToClose={!isLoading}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
                enableDynamicSizing={false}
                onDismiss={() => {
                    if (!isLoading) {
                        resetForm();
                        onDismissed?.();
                    }
                }}
            >
                <LinearGradient
                    colors={['#264387', '#1D548D', '#176192']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.gradientContainer}
                >
                    {/* Close Button - Fixed at top */}
                    <View style={styles.headerContainer}>
                        <Pressable
                            style={styles.closeButton}
                            onPress={handleCancel}
                            disabled={isLoading}
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </Pressable>

                        {/* Header */}
                        <LinearGradient
                            colors={["#7C3AED", "#38BDF8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>
                                    {isEditMode ? 'Edit Phase Details' : 'Create New Roadmap'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Scrollable Form Content */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <BottomSheetScrollView
                            keyboardShouldPersistTaps="handled"
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formContainer}>
                                {/* Type Dropdown */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>Type</Text>
                                    <Pressable
                                        style={[
                                            styles.dropdown,
                                            (isEditMode || isLoading) && styles.dropdownDisabled
                                        ]}
                                        onPress={() => !isEditMode && !isLoading && setShowTypeDropdown(!showTypeDropdown)}
                                        disabled={isEditMode || isLoading}
                                    >
                                        <Text style={styles.dropdownText}>
                                            {getTypeDisplayText(formData.type)}
                                        </Text>
                                        <Ionicons
                                            name={showTypeDropdown ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color="#fff"
                                        />
                                    </Pressable>

                                    {showTypeDropdown && !isEditMode && !isLoading && (
                                        <View style={styles.dropdownOptions}>
                                            <TouchableOpacity
                                                style={styles.dropdownOption}
                                                onPress={() => handleTypeSelect("single")}
                                            >
                                                <Text style={styles.dropdownOptionText}>
                                                    Single
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.dropdownOption}
                                                onPress={() => handleTypeSelect("phase")}
                                            >
                                                <Text style={styles.dropdownOptionText}>Phase</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {/* Dynamic Name Field */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {formData.type === "phase" ? "Name of Phase" : "Roadmap Name"}
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={
                                            formData.type === "phase"
                                                ? "Enter Name of Phase"
                                                : "Enter Name"
                                        }
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.name}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({ ...prev, name: text }))
                                        }
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Dynamic Subheading Field */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {formData.type === "phase"
                                            ? "Name of Subtitle for Phase"
                                            : "Roadmap Subheading"}
                                    </Text>
                                    <TextInput
                                        style={[styles.textInput, styles.textArea]}
                                        placeholder={
                                            formData.type === "phase"
                                                ? "Enter Subtitle"
                                                : "Enter Subheading"
                                        }
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.subheading}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({ ...prev, subheading: text }))
                                        }
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Dynamic Completion Time Field */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {formData.type === "phase"
                                            ? "Completion Time for the Phase"
                                            : "Completion Time for the Roadmap"}
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="1-2 Months"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.completionTime}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                completionTime: text,
                                            }))
                                        }
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Division of Phase */}
                                {formData.type === "phase" && (
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.fieldLabel}>Division of Phase</Text>

                                        <View style={styles.divisionInputContainer}>
                                            <TextInput
                                                key={`division-input-${formData.divisions.length}`}
                                                style={[styles.textInput, styles.divisionInput]}
                                                placeholder="None"
                                                placeholderTextColor="rgba(255,255,255,0.5)"
                                                value={newDivision}
                                                onChangeText={setNewDivision}
                                                editable={!isLoading}
                                            />
                                            <TouchableOpacity
                                                style={[
                                                    styles.addButton,
                                                    isLoading && styles.buttonDisabled
                                                ]}
                                                onPress={handleAddDivision}
                                                disabled={isLoading}
                                            >
                                                <Ionicons name="add" size={20} color="#fff" />
                                                <Text style={styles.addButtonText}>Add</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {formData.divisions.length > 0 && (
                                            <View style={styles.tagsContainer}>
                                                {formData.divisions.map((division, index) => (
                                                    <View key={index} style={styles.tag}>
                                                        <Text style={styles.tagText}>{division}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => handleRemoveDivision(index)}
                                                            style={styles.tagRemove}
                                                            disabled={isLoading}
                                                        >
                                                            <Ionicons
                                                                name="close"
                                                                size={16}
                                                                color="#fff"
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Upload Banner */}
                                {formData.bannerImage ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image
                                            source={{ uri: formData.bannerImage }}
                                            style={styles.imagePreview}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.changeImageButton,
                                                isLoading && styles.buttonDisabled
                                            ]}
                                            onPress={handleImagePicker}
                                            disabled={isLoading}
                                        >
                                            <Text style={styles.changeImageText}>Change Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.uploadButton,
                                            isLoading && styles.buttonDisabled
                                        ]}
                                        onPress={handleImagePicker}
                                        disabled={isLoading}
                                    >
                                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                        <Text style={styles.uploadButtonText}>
                                            {formData.type === "phase"
                                                ? "Upload Banner Image for the Phase"
                                                : "Upload Banner Image for the Roadmap"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </BottomSheetScrollView>

                    {/* Action Buttons - Fixed at bottom */}
                        <View style={[styles.actionButtons, { paddingBottom: bottom + 20 }]}>
                            <TouchableOpacity
                                style={[
                                    styles.cancelButton,
                                    isLoading && styles.buttonDisabled
                                ]}
                                onPress={handleCancel}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    (!isFormValid() || isLoading) && styles.nextButtonDisabled,
                                ]}
                                onPress={handleCreate}
                                disabled={!isFormValid() || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text
                                        style={[
                                            styles.nextButtonText,
                                            !isFormValid() && styles.nextButtonTextDisabled,
                                        ]}
                                    >
                                        Create
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>

                </LinearGradient>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        display: 'none'
    },
    handleIndicator: {
        display: "none",
    },
    gradientContainer: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    closeButton: {
        alignItems: "flex-end",
        justifyContent: "center",
        marginBottom: 10,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
        marginBottom: 10,
    },
    header: {
        alignItems: "center",
        backgroundColor: "#264387",
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 28,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    formContainer: {
        gap: 20,
    },
    fieldContainer: {
        gap: 8,
        position: "relative",
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    dropdownText: {
        fontSize: 16,
        color: "#fff",
    },
    dropdownDisabled: {
        opacity: 0.6,
    },
    dropdownOptions: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "#2A4A7F",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        marginTop: 4,
        zIndex: 1000,
        overflow: "hidden",
    },
    dropdownOption: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    dropdownOptionText: {
        fontSize: 16,
        color: "#fff",
    },
    textInput: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#fff",
    },
    textArea: {
        height: 100,
        paddingTop: 16,
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 20,
        gap: 12,
        marginTop: 8,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 16,
        paddingHorizontal: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E3A6F",
    },
    nextButton: {
        flex: 1,
        backgroundColor: "#2A4A7F",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    nextButtonDisabled: {
        backgroundColor: "rgba(42, 74, 127, 0.5)",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    nextButtonTextDisabled: {
        color: "rgba(255, 255, 255, 0.5)",
    },
    divisionInputContainer: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-end",
    },
    divisionInput: {
        flex: 1,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.4)",
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 8,
        minWidth: 80,
        justifyContent: "center",
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600",
    },
    tagRemove: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePreviewContainer: {
        marginTop: 8,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
    },
    imagePreview: {
        width: "100%",
        height: 100,
        resizeMode: "cover",
    },
    changeImageButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingVertical: 12,
        alignItems: "center",
        borderTopWidth: 1.5,
        borderTopColor: "rgba(255,255,255,0.3)",
    },
    changeImageText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default CreateRoadmapSheet;

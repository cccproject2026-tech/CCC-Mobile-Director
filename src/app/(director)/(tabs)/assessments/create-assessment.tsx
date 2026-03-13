import TopBar from '@/components/Header/TopBar';
import SuccessModal from '@/components/Modals/SuccessModal';
import { icons } from '@/constants';
import { useCreateAssessmentMutation, useUploadBannerImageMutation } from '@/hooks/useAssessments';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Instruction {
    id: string;
    text: string;
}

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
    plans: Plan[];
}

interface Section {
    id: string;
    name: string;
    guidelines: string;
    layers: Layer[];
    recommendations: SectionRecommendationLevel[];
}

interface Plan {
    id: string;
    text: string;
}

type AssessmentType = 'PMP' | 'CMA';

interface PreSurveyQuestion {
    id: string;
    text: string;
    type: 'text' | 'number';
    placeholder: string;
}

const emptySectionRecommendations = (): SectionRecommendationLevel[] => [
    { level: 1, plans: [{ id: '1', text: '' }] },
    { level: 2, plans: [{ id: '1', text: '' }] },
    { level: 3, plans: [{ id: '1', text: '' }] },
    { level: 4, plans: [{ id: '1', text: '' }] },
];

const newSectionRecommendations = (): SectionRecommendationLevel[] => {
    const ts = Date.now();
    return [
        { level: 1, plans: [{ id: `${ts}-1-1`, text: '' }] },
        { level: 2, plans: [{ id: `${ts}-2-1`, text: '' }] },
        { level: 3, plans: [{ id: `${ts}-3-1`, text: '' }] },
        { level: 4, plans: [{ id: `${ts}-4-1`, text: '' }] },
    ];
};

export default function CreateAssessmentPage() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();

    // Pre-Survey Toggle (determines PMP vs CMA)
    const [hasPreSurvey, setHasPreSurvey] = useState(false);

    // Assessment Details
    const [assessmentName, setAssessmentName] = useState('');
    const [briefDescription, setBriefDescription] = useState('');

    // General Instructions
    const [instructions, setInstructions] = useState<Instruction[]>([
        { id: '1', text: '' },
    ]);

    // Pre-Survey Questions (shown only if hasPreSurvey is true)
    const [preSurveyQuestions, setPreSurveyQuestions] = useState<PreSurveyQuestion[]>([
        { id: '1', text: '', type: 'number', placeholder: 'Enter number' },
    ]);

    // Sections (each section has its own recommendations for Level 1–4 CDP)
    const [sections, setSections] = useState<Section[]>([
        {
            id: '1',
            name: '',
            guidelines: '',
            layers: [
                { id: '1', title: '', choices: [{ id: '1', text: '' }] },
                { id: '2', title: '', choices: [{ id: '1', text: '' }] },
            ],
            recommendations: emptySectionRecommendations(),
        },
    ]);

    // Dropdown states for each section
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    // Loading and success states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);

    const createAssessmentMutation = useCreateAssessmentMutation();
    const uploadBannerMutation = useUploadBannerImageMutation();

    // Image Upload
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadedImage(result.assets[0].uri);
        }
    };

    const addInstruction = () => {
        setInstructions([
            ...instructions,
            { id: Date.now().toString(), text: '' },
        ]);
    };

    const removeInstruction = (id: string) => {
        if (instructions.length <= 1) return;
        setInstructions(instructions.filter((inst) => inst.id !== id));
    };

    const updateInstruction = (id: string, text: string) => {
        setInstructions(
            instructions.map((inst) => (inst.id === id ? { ...inst, text } : inst))
        );
    };

    const addPreSurveyQuestion = () => {
        setPreSurveyQuestions([
            ...preSurveyQuestions,
            { id: Date.now().toString(), text: '', type: 'number', placeholder: 'Enter number' },
        ]);
    };

    const removePreSurveyQuestion = (id: string) => {
        if (preSurveyQuestions.length <= 1) return;
        setPreSurveyQuestions(preSurveyQuestions.filter((q) => q.id !== id));
    };

    const updatePreSurveyQuestion = (id: string, text: string) => {
        setPreSurveyQuestions(
            preSurveyQuestions.map((q) => (q.id === id ? { ...q, text } : q))
        );
    };

    const addSection = () => {
        setSections([
            ...sections,
            {
                id: Date.now().toString(),
                name: '',
                guidelines: '',
                layers: [{ id: '1', title: '', choices: [{ id: '1', text: '' }] }],
                recommendations: newSectionRecommendations(),
            },
        ]);
    };

    const removeSection = (sectionId: string) => {
        if (sections.length <= 1) return;
        setSections(sections.filter((s) => s.id !== sectionId));
    };

    const updateSectionName = (sectionId: string, name: string) => {
        setSections(
            sections.map((s) => (s.id === sectionId ? { ...s, name } : s))
        );
    };

    const updateSectionGuidelines = (sectionId: string, guidelines: string) => {
        setSections(
            sections.map((s) => (s.id === sectionId ? { ...s, guidelines } : s))
        );
    };

    const updateLayerCount = (sectionId: string, count: number) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                const newLayers: Layer[] = [];
                for (let i = 0; i < count; i++) {
                    const existingLayer = s.layers[i];
                    newLayers.push(
                        existingLayer || {
                            id: `${Date.now()}-${i}`,
                            title: '',
                            choices: [{ id: `${Date.now()}-choice-${i}`, text: '' }],
                        }
                    );
                }
                return { ...s, layers: newLayers };
            })
        );
        setOpenDropdowns((prev) => {
            const next = new Set(prev);
            next.delete(sectionId);
            return next;
        });
    };

    const toggleDropdown = (sectionId: string) => {
        setOpenDropdowns((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const addChoice = (sectionId: string, layerId: string) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    layers: s.layers.map((l) => {
                        if (l.id !== layerId) return l;
                        return {
                            ...l,
                            choices: [
                                ...l.choices,
                                { id: Date.now().toString(), text: '' },
                            ],
                        };
                    }),
                };
            })
        );
    };

    const removeChoice = (sectionId: string, layerId: string, choiceId: string) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    layers: s.layers.map((l) => {
                        if (l.id !== layerId) return l;
                        if (l.choices.length <= 1) return l;
                        return {
                            ...l,
                            choices: l.choices.filter((c) => c.id !== choiceId),
                        };
                    }),
                };
            })
        );
    };

    const updateChoice = (
        sectionId: string,
        layerId: string,
        choiceId: string,
        text: string
    ) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    layers: s.layers.map((l) => {
                        if (l.id !== layerId) return l;
                        return {
                            ...l,
                            choices: l.choices.map((c) =>
                                c.id === choiceId ? { ...c, text } : c
                            ),
                        };
                    }),
                };
            })
        );
    };

    const addSectionPlan = (sectionId: string, level: 1 | 2 | 3 | 4) => {
        const newPlan = { id: Date.now().toString(), text: '' };
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    recommendations: s.recommendations.map((rec) =>
                        rec.level === level
                            ? { ...rec, plans: [...rec.plans, newPlan] }
                            : rec
                    ),
                };
            })
        );
    };

    const removeSectionPlan = (sectionId: string, level: 1 | 2 | 3 | 4, planId: string) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    recommendations: s.recommendations.map((rec) => {
                        if (rec.level !== level) return rec;
                        if (rec.plans.length <= 1) return rec;
                        return {
                            ...rec,
                            plans: rec.plans.filter((p) => p.id !== planId),
                        };
                    }),
                };
            })
        );
    };

    const updateSectionPlan = (
        sectionId: string,
        level: 1 | 2 | 3 | 4,
        planId: string,
        text: string
    ) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    recommendations: s.recommendations.map((rec) =>
                        rec.level === level
                            ? {
                                  ...rec,
                                  plans: rec.plans.map((p) =>
                                      p.id === planId ? { ...p, text } : p
                                  ),
                              }
                            : rec
                    ),
                };
            })
        );
    };

    const handleCreate = async () => {
        // Validation
        if (!assessmentName.trim()) {
            Alert.alert('Error', 'Please enter an assessment name.');
            return;
        }

        if (!briefDescription.trim()) {
            Alert.alert('Error', 'Please enter a description.');
            return;
        }

        // Filter out empty instructions
        const validInstructions = instructions
            .map((inst) => inst.text.trim())
            .filter((text) => text.length > 0);

        if (validInstructions.length === 0) {
            Alert.alert('Error', 'Please add at least one instruction.');
            return;
        }

        // Validate pre-survey questions if hasPreSurvey is true
        let validPreSurvey: { text: string; type: string; placeholder: string; required: boolean }[] = [];
        if (hasPreSurvey) {
            validPreSurvey = preSurveyQuestions
                .filter((q) => q.text.trim().length > 0)
                .map((q) => ({
                    text: q.text.trim(),
                    type: q.type,
                    placeholder: q.placeholder,
                    required: true,
                }));

            if (validPreSurvey.length === 0) {
                Alert.alert('Error', 'Please add at least one pre-survey question.');
                return;
            }
        }

        // Validate sections (each section includes its own recommendations for Level 1–4 CDP)
        const validSections = sections
            .map((section) => {
                const validLayers = section.layers
                    .map((layer, layerIndex) => {
                        const validChoices = layer.choices
                            .map((choice) => choice.text.trim())
                            .filter((text) => text.length > 0);

                        if (validChoices.length === 0) {
                            return null;
                        }

                        return {
                            title: layer.title.trim() || `Layer ${layerIndex + 1}`,
                            choices: validChoices.map((text) => ({ text })),
                        };
                    })
                    .filter(
                        (layer): layer is {
                            title: string;
                            choices: { text: string }[];
                        } => layer !== null
                    );

                if (validLayers.length === 0 || !section.name.trim()) {
                    return null;
                }

                const recommendations = (section.recommendations ?? []).map(
                    (rec) => ({
                        level: rec.level,
                        items: rec.plans
                            .map((p) => p.text.trim())
                            .filter((text) => text.length > 0),
                    })
                );

                return {
                    title: section.name.trim(),
                    description: section.guidelines.trim() || 'No guidelines provided',
                    layers: validLayers,
                    recommendations,
                };
            })
            .filter(
                (section): section is {
                    title: string;
                    description: string;
                    layers: { title: string; choices: { text: string }[] }[];
                    recommendations: { level: 1 | 2 | 3 | 4; items: string[] }[];
                } => section !== null
            );

        if (validSections.length === 0) {
            Alert.alert(
                'Error',
                'Please add at least one section with layers and choices.'
            );
            return;
        }

        // Determine assessment type based on hasPreSurvey
        const assessmentType: AssessmentType = hasPreSurvey ? 'CMA' : 'PMP';

        const requestData: any = {
            name: assessmentName.trim(),
            description: briefDescription.trim(),
            type: assessmentType,
            instructions: validInstructions,
            sections: validSections,
        };

        // Add preSurvey only if hasPreSurvey is true
        if (hasPreSurvey) {
            requestData.preSurvey = validPreSurvey;
        }

        console.log('📤 Sending Assessment Data:', JSON.stringify(requestData, null, 2));

        createAssessmentMutation.mutate(requestData, {
            onSuccess: (data) => {
                // Store the created assessment ID
                const assessmentId = data._id
                setCreatedAssessmentId(assessmentId);

                console.log('✅ Assessment created successfully with ID:', assessmentId);

                // If there's an uploaded image, upload it separately
                if (uploadedImage && assessmentId) {
                    console.log('📤 Uploading banner image for assessment:', assessmentId);
                    uploadBannerMutation.mutate({ id: assessmentId, imageUri: uploadedImage }, {
                        onSuccess: () => {
                            console.log('✅ Banner image uploaded successfully');
                            setShowSuccessModal(true);
                        },
                        onError: (err) => {
                            console.error('❌ Failed to upload banner image:', err);
                            // Still show success modal since assessment was created
                            Alert.alert(
                                'Partial Success',
                                'Assessment created but failed to upload banner image.'
                            );
                            setShowSuccessModal(true);
                        },
                    });
                } else {
                    // No image to upload, show success immediately
                    setShowSuccessModal(true);
                }
            },
            onError: (err) => {
                console.error('❌ Failed to create assessment:', err);
                Alert.alert('Error', 'Failed to create assessment. Please try again.');
            },
        });
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <LinearGradient colors={['#155C93', '#1B2B60']} style={{ flex: 1 }}>
                <TopBar showUserName />

                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={10}>
                        <Ionicons name="chevron-back" size={28} color="#E2E8F0" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Create - Assessment</Text>
                </View>

                {/* Form Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingBottom: bottom + 100,
                        paddingTop: 16,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                {/* Assessment Details */}
                <TextInput
                    style={styles.inputBox}
                    placeholder="Name of Assessment"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={assessmentName}
                    onChangeText={setAssessmentName}
                />
                <TextInput
                    style={styles.inputBox}
                    placeholder="Brief Description for Thumbnail"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={briefDescription}
                    onChangeText={setBriefDescription}
                />

                {/* Divider */}
                <View style={styles.divider} />

                {/* Pre-Survey Toggle */}
                <View style={styles.typeSelectionContainer}>
                    <Text style={styles.typeLabel}>Include Pre-Survey Questions?</Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => setHasPreSurvey(false)}
                        >
                            <View style={styles.radioCircle}>
                                {!hasPreSurvey && (
                                    <View style={styles.radioSelected} />
                                )}
                            </View>
                            <Text style={styles.radioText}>No</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => setHasPreSurvey(true)}
                        >
                            <View style={styles.radioCircle}>
                                {hasPreSurvey && (
                                    <View style={styles.radioSelected} />
                                )}
                            </View>
                            <Text style={styles.radioText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* General Instructions */}
                <View style={styles.boxContainer}>
                    <Text style={styles.boxTitle}>
                        General Instructions for the Assessment
                    </Text>
                    {instructions.map((inst, index) => (
                        <View key={inst.id} style={styles.instructionRow}>
                            <TextInput
                                style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}
                                placeholder={`Instruction ${index + 1}`}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={inst.text}
                                onChangeText={(text) => updateInstruction(inst.id, text)}
                            />
                            {instructions.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeInstruction(inst.id)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addBtn} onPress={addInstruction}>
                        <Ionicons name="add" size={16} color="#FFF" />
                        <Text style={styles.addBtnText}>Instruction</Text>
                    </TouchableOpacity>
                </View>

                {/* Pre-Survey Questions (shown only if hasPreSurvey is true) */}
                {hasPreSurvey && (
                    <View style={styles.boxContainer}>
                        <Text style={styles.boxTitle}>Pre-Survey Questions</Text>
                        <Text style={styles.boxSubtitle}>
                            These questions will be shown before the main assessment
                        </Text>
                        {preSurveyQuestions.map((q, index) => (
                            <View key={q.id} style={styles.preSurveyRow}>
                                <TextInput
                                    style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}
                                    placeholder={`${index + 1}. What is your current church membership?`}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={q.text}
                                    onChangeText={(text) =>
                                        updatePreSurveyQuestion(q.id, text)
                                    }
                                />
                                {preSurveyQuestions.length > 1 && (
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removePreSurveyQuestion(q.id)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={addPreSurveyQuestion}
                        >
                            <Ionicons name="add" size={16} color="#FFF" />
                            <Text style={styles.addBtnText}>Question</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Sections */}
                <View style={styles.sectionsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>Sections</Text>
                        <TouchableOpacity style={styles.addBtn} onPress={addSection}>
                            <Ionicons name="add" size={16} color="#FFF" />
                            <Text style={styles.addBtnText}>Section</Text>
                        </TouchableOpacity>
                    </View>

                    {sections.map((section, sectionIndex) => (
                        <View key={section.id} style={styles.sectionBox}>
                            <View style={styles.sectionTitleRow}>
                                <Text style={styles.sectionTitle}>
                                    Section {sectionIndex + 1}
                                </Text>
                                {sections.length > 1 && (
                                    <TouchableOpacity
                                        style={styles.removeSectionButton}
                                        onPress={() => removeSection(section.id)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TextInput
                                style={styles.inputBox}
                                placeholder={`Name of Section ${sectionIndex + 1}`}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={section.name}
                                onChangeText={(text) => updateSectionName(section.id, text)}
                            />

                            <TextInput
                                style={[styles.inputBox, styles.textArea]}
                                placeholder={`Guidelines for Section ${sectionIndex + 1}`}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={section.guidelines}
                                onChangeText={(text) =>
                                    updateSectionGuidelines(section.id, text)
                                }
                                multiline
                                numberOfLines={3}
                            />

                            {/* Number of Layers with +/- buttons */}
                            <View style={styles.layerCountContainer}>
                                <Text style={styles.layerCountLabel}>Number of Layers:</Text>
                                <View style={styles.layerCountControls}>
                                    <TouchableOpacity
                                        style={[
                                            styles.layerCountButton,
                                            section.layers.length <= 1 && styles.layerCountButtonDisabled,
                                        ]}
                                        onPress={() => {
                                            if (section.layers.length > 1) {
                                                updateLayerCount(section.id, section.layers.length - 1);
                                            }
                                        }}
                                        disabled={section.layers.length <= 1}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={20}
                                            color={section.layers.length <= 1 ? 'rgba(255,255,255,0.3)' : '#FFFFFF'}
                                        />
                                    </TouchableOpacity>

                                    <View style={styles.layerCountDisplay}>
                                        <Text style={styles.layerCountText}>{section.layers.length}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.layerCountButton}
                                        onPress={() => updateLayerCount(section.id, section.layers.length + 1)}
                                    >
                                        <Ionicons name="add" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Layers */}
                            {section.layers.map((layer, layerIndex) => (
                                <View key={layer.id} style={styles.layerBox}>
                                    <Text style={styles.layerTitle}>Layer {layerIndex + 1}</Text>

                                    {/* Choices */}
                                    <Text style={styles.layerFieldLabel}>Choices</Text>
                                    {layer.choices.map((choice, choiceIndex) => (
                                        <View key={choice.id} style={styles.choiceRow}>
                                            <TextInput
                                                style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}
                                                placeholder={`Choice ${choiceIndex + 1}`}
                                                placeholderTextColor="rgba(255,255,255,0.5)"
                                                value={choice.text}
                                                onChangeText={(text) =>
                                                    updateChoice(section.id, layer.id, choice.id, text)
                                                }
                                            />
                                            {layer.choices.length > 1 && (
                                                <TouchableOpacity
                                                    style={styles.removeButton}
                                                    onPress={() => removeChoice(section.id, layer.id, choice.id)}
                                                >
                                                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.addBtn}
                                        onPress={() => addChoice(section.id, layer.id)}
                                    >
                                        <Ionicons name="add" size={16} color="#FFF" />
                                        <Text style={styles.addBtnText}>Add Choice</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Per-section CDP: Level 1–4 Customized Development Plans */}
                            <View style={styles.cdpSection}>
                                <Text style={styles.cdpSectionTitle}>
                                    Customized Development Plans (this section)
                                </Text>
                                {(section.recommendations ?? []).map((rec) => (
                                    <View key={rec.level} style={styles.cdpLevelContainer}>
                                        <Text style={styles.cdpLevelTitle}>
                                            Level {rec.level} - Customized Development Plans
                                        </Text>
                                        {rec.plans.map((plan, index) => (
                                            <View key={plan.id} style={styles.planRow}>
                                                <TextInput
                                                    style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}
                                                    placeholder={`Plan ${index + 1}`}
                                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                                    value={plan.text}
                                                    onChangeText={(text) =>
                                                        updateSectionPlan(section.id, rec.level, plan.id, text)
                                                    }
                                                />
                                                {rec.plans.length > 1 && (
                                                    <TouchableOpacity
                                                        style={styles.removeButton}
                                                        onPress={() => removeSectionPlan(section.id, rec.level, plan.id)}
                                                    >
                                                        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        ))}
                                        {rec.plans.length < 8 && (
                                            <TouchableOpacity
                                                style={styles.addBtn}
                                                onPress={() => addSectionPlan(section.id, rec.level)}
                                            >
                                                <Ionicons name="add" size={16} color="#FFF" />
                                                <Text style={styles.addBtnText}>Plan</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Image Upload */}
                <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={handleImagePicker}
                >
                    <Image source={icons.attachmentIcon} style={styles.uploadIcon} />
                    <Text style={styles.uploadText}>Upload Banner Image</Text>
                </TouchableOpacity>

                {uploadedImage && (
                    <Image source={{ uri: uploadedImage }} style={styles.previewImage} />
                )}

                {/* Action Buttons */}
                <View style={styles.actionBtns}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={handleCreate}
                        disabled={createAssessmentMutation.isPending || uploadBannerMutation.isPending}
                    >
                        {(createAssessmentMutation.isPending || uploadBannerMutation.isPending) ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.createBtnText}>Create Assessment</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Success Modal */}
            <SuccessModal
                message="Assessment Created Successfully"
                visible={showSuccessModal}
                onClose={handleSuccessModalClose}
            />
        </LinearGradient>
        </KeyboardAvoidingView>
    );
}



const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        color: '#E2E8F0',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },

    // Plain Inputs (Name, Description)
    inputPlain: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.45)',
        paddingHorizontal: 0,
        paddingVertical: 12,
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 16,
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.45)',
        marginVertical: 16,
    },

    // Type Selection
    typeSelectionContainer: {
        marginBottom: 24,
    },
    typeLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 32,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
    },
    radioText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },

    // Box Container (Instructions, Pre-Survey)
    boxContainer: {
        backgroundColor: 'rgba(21, 92, 147, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    boxTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    boxSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginBottom: 12,
    },
    inputBox: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },

    // Add Button
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        gap: 4,
        paddingVertical: 4,
    },
    addBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // Sections
    sectionsContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionHeaderText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
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
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    removeSectionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
    },

    // Layer Count Controls
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

    // Layers
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

    // CDP Section
    cdpSection: {
        marginTop: 20,
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

    // Remove Button
    removeButton: {
        padding: 4,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    preSurveyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },

    // Upload
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
        borderRadius: 12,
        paddingVertical: 12,
        gap: 8,
        marginBottom: 16,
    },
    uploadIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFFFFF',
    },
    uploadText: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
        resizeMode: 'cover',
    },

    // Action Buttons
    actionBtns: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#155C93',
        fontSize: 15,
        fontWeight: '600',
    },
    createBtn: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    createBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});

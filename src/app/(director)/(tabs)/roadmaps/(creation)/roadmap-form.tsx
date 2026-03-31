// app/(director)/(tabs)/revitalization-roadmaps/(creation)/roadmap-form.tsx

import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
    useRoadmap,
    useCreateNestedRoadmap,
    useUpdateRoadmap,
} from '@/hooks/roadmap/useRoadmaps';
import { RoadmapExtra, CreateNestedRoadmapRequest } from '@/types/roadmap.types';
import { AddFieldSheetContext } from '@/contexts/AddFieldSheetContext';
import CustomMenu, { MenuItem } from '@/components/Menu/CustomMenu';
import { AssessmentRenderer, ButtonRenderer, CheckboxRenderer, DatePickerRenderer, DigitalSignatureRenderer, SectionRenderer, TextAreaRenderer, TextDisplayRenderer, TextFieldRenderer, UploadButtonRenderer } from '@/components/Forms/field-renders';
import RoadMapFormHeader from '@/components/Header/RoadMapFormHeader';
import TopBar from '@/components/Header/TopBar';

export type FieldType = 'text' | 'textarea' | 'upload' | 'datepicker' | 'assessment' | 'section' | 'checkbox_item' | 'text_display' | 'button' | 'digital_signature';

export default function RoadmapFormScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const addFieldSheet = useContext(AddFieldSheetContext);

    const navigation = useNavigation();

    // ✅ Parse params
    const isEditMode = params.isEditMode === 'true';
    const roadmapId = params.roadmapId as string;
    const nestedRoadmapId = params.nestedRoadmapId as string;
    const roadmapType = (params.type as 'single' | 'phase') || 'single';

    console.log('RoadmapFormScreen params:', params);
    console.log('Roadmap Type:', roadmapType);
    // ✅ Fetch parent roadmap (only if editing)
    const { data: parentRoadmap, isLoading } = useRoadmap(roadmapId);

    console.log('Parent Roadmap:', parentRoadmap);
    // ✅ Mutations
    const createNestedMutation = useCreateNestedRoadmap();
    const updateRoadmapMutation = useUpdateRoadmap();

    // ✅ Get data from params
    const roadmapData = {
        name: (params.name as string) || '',
        subheading: (params.subheading as string) || '',
        completionTime: (params.completionTime as string) || '',
        selectedDivision: (params.selectedDivision as string) || 'All',
        bannerImage: (params.bannerImage as string) || null,
    };

    // ✅ Form state
    const [formData, setFormData] = useState({
        churchVerbiage: '',
        descriptionVerbiage: '',
        customFields: [] as any[],
    });

    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    }>({ top: 0, right: 16 });

    // ✅ Ref for "Add Field" button to get position
    const addFieldButtonRef = useRef<any>(null);

    const handleDateChange = (fieldId: string, date: Date) => {
        setFormData((prev) => ({
            ...prev,
            customFields: prev.customFields.map((f) =>
                f.id === fieldId ? { ...f, date } : f
            ),
        }));
    };

    // ✅ Transform extras helpers
    const transformExtrasToFields = (extras: RoadmapExtra[]): any[] => {
        const fields: any[] = [];
        let fieldIndex = 0;

        extras.forEach((extra) => {
            const fieldId = `field_${Date.now()}_${fieldIndex++}`;

            switch (extra.type) {
                case 'TEXT_AREA':
                    fields.push({
                        id: fieldId,
                        type: 'textarea',
                        label: extra.name,
                        placeholder: extra.placeHolder || '',
                    });
                    break;
                case 'TEXT_FIELD':
                    fields.push({
                        id: fieldId,
                        type: 'text',
                        label: extra.name,
                        placeholder: extra.placeHolder || '',
                    });
                    break;
                case 'UPLOAD':
                    fields.push({
                        id: fieldId,
                        type: 'upload',
                        buttonLabel: extra.name,
                    });
                    break;
                case 'DATE_PICKER':
                    fields.push({
                        id: fieldId,
                        type: 'datepicker',
                        label: extra.name,
                        date: extra.date ? new Date(extra.date) : new Date(), // ✅ Always provide a date
                        buttonName: extra.buttonName || '',
                        allowPastorSelect: extra.checkboxes?.some(
                            (cb) => cb.name === 'Allow pastor to select Date'
                        ),
                        showOnCard: extra.checkboxes?.some(
                            (cb) => cb.name === 'Show date on info card'
                        ),
                    });
                    break;
                case 'ASSESSMENT':
                    fields.push({
                        id: fieldId,
                        type: 'assessment',
                        selectedAssessment: extra.name,
                        assessmentId: extra.assessmentId, // ✅ Preserve assessmentId
                        buttonName: extra.buttonName || '',
                        scheduleMeeting: extra.checkboxes?.some(
                            (cb) => cb.name === 'Schedule Meeting after the Assessment'
                        ),
                    });
                    break;
                case 'CHECKBOX':
                    fields.push({
                        id: fieldId,
                        type: 'checkbox_item',
                        name: extra.name,
                        haveButton: extra.haveButton || false,
                        buttonName: extra.buttonName || '',
                    });
                    break;
                case 'TEXT_DISPLAY':
                    fields.push({
                        id: fieldId,
                        type: 'text_display',
                        name: extra.name,
                    });
                    break;
                case 'BUTTON':
                    fields.push({
                        id: fieldId,
                        type: 'button',
                        name: extra.name || 'Action Button',
                        linkUrl: extra.linkUrl || '',
                    });
                    break;
                case 'SIGNATURE':
                    fields.push({
                        id: fieldId,
                        type: 'digital_signature',
                        fieldName: extra.name,
                        placeholderText: extra.placeHolder || 'Sign here using your finger',
                        clearButtonLabel: extra.buttonName || 'Clear',
                        required: extra.required ?? false,
                        showOnInfoCard: extra.showOnCard ?? false,
                    });
                    break;
                case 'SECTION':
                    const sectionField = {
                        id: fieldId,
                        type: 'section',
                        name: extra.name,
                        buttonName: extra.buttonName || '',
                        showDuplicateButton: extra.checkboxes?.some((cb) => cb.haveButton) || false,
                    };

                    fields.push(sectionField);

                    if (extra.sections) {
                        extra.sections.forEach((sectionExtra) => {
                            const nestedFieldId = `field_${Date.now()}_${fieldIndex++}`;
                            const baseNestedField = {
                                id: nestedFieldId,
                                parentSectionId: fieldId,
                            };

                            switch (sectionExtra.type) {
                                case 'TEXT_FIELD':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'text',
                                        label: sectionExtra.name,
                                        placeholder: sectionExtra.placeHolder || '',
                                    });
                                    break;
                                case 'TEXT_AREA':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'textarea',
                                        label: sectionExtra.name,
                                        placeholder: sectionExtra.placeHolder || '',
                                    });
                                    break;
                                case 'UPLOAD':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'upload',
                                        buttonLabel: sectionExtra.name,
                                    });
                                    break;
                                case 'DATE_PICKER':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'datepicker',
                                        label: sectionExtra.name,
                                        date: sectionExtra.date ? new Date(sectionExtra.date) : new Date(),
                                        buttonName: sectionExtra.buttonName || '',
                                        allowPastorSelect: sectionExtra.checkboxes?.some(
                                            (cb) => cb.name === 'Allow pastor to select Date'
                                        ),
                                        showOnCard: sectionExtra.checkboxes?.some(
                                            (cb) => cb.name === 'Show date on info card'
                                        ),
                                    });
                                    break;
                                case 'ASSESSMENT':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'assessment',
                                        selectedAssessment: sectionExtra.name,
                                        assessmentId: sectionExtra.assessmentId,
                                        buttonName: sectionExtra.buttonName || '',
                                        scheduleMeeting: sectionExtra.checkboxes?.some(
                                            (cb) => cb.name === 'Schedule Meeting after the Assessment'
                                        ),
                                    });
                                    break;
                                case 'CHECKBOX':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'checkbox_item',
                                        name: sectionExtra.name,
                                        haveButton: sectionExtra.haveButton || false,
                                        buttonName: sectionExtra.buttonName || '',
                                    });
                                    break;
                                case 'TEXT_DISPLAY':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'text_display',
                                        name: sectionExtra.name,
                                    });
                                    break;
                                case 'BUTTON':
                                    fields.push({
                                        ...baseNestedField,
                                        type: 'button',
                                        name: sectionExtra.name || 'Action Button',
                                        linkUrl: sectionExtra.linkUrl || '',
                                    });
                                    break;
                            }
                        });
                    }
                    break;
            }
        });

        return fields;
    };

    const transformFieldsToExtras = (fields: any[]): RoadmapExtra[] => {
        return fields
            .filter((field) => !field.parentSectionId)
            .map((field) => {
                const nestedFields = fields.filter((f) => f.parentSectionId === field.id);

                switch (field.type) {
                    case 'textarea':
                        return {
                            type: 'TEXT_AREA' as const,
                            name: field.label || field.name || 'Text Field',
                            ...(field.placeholder && { placeHolder: field.placeholder }),
                        };
                    case 'text':
                        return {
                            type: 'TEXT_FIELD' as const,
                            name: field.label || field.name || 'Text Field',
                            ...(field.placeholder && { placeHolder: field.placeholder }),
                        };
                    case 'upload':
                        return {
                            type: 'UPLOAD' as const,
                            name: field.buttonLabel || 'Upload',
                        };
                    case 'datepicker':
                        const dateCheckboxes = [
                            field.allowPastorSelect && {
                                type: 'CHECKBOX' as const,
                                name: 'Allow pastor to select Date',
                                haveButton: false,
                            },
                            field.showOnCard && {
                                type: 'CHECKBOX' as const,
                                name: 'Show date on info card',
                                haveButton: false,
                            },
                        ].filter(Boolean) as RoadmapExtra[];

                        return {
                            type: 'DATE_PICKER' as const,
                            name: field.label || 'Date',
                            ...(field.date && {
                                date: new Date(field.date).toISOString().split('T')[0],
                            }),
                            ...(field.buttonName && { buttonName: field.buttonName }),
                            ...(dateCheckboxes.length > 0 && { checkboxes: dateCheckboxes }),
                        };
                    case 'assessment':
                        const assessmentCheckboxes = [
                            field.scheduleMeeting && {
                                type: 'CHECKBOX' as const,
                                name: 'Schedule Meeting after the Assessment',
                                haveButton: false,
                            },
                        ].filter(Boolean) as RoadmapExtra[];

                        return {
                            type: 'ASSESSMENT' as const,
                            name: typeof field.selectedAssessment === 'object'
                                ? field.selectedAssessment.name
                                : (field.selectedAssessment || 'Assessment'),
                            assessmentId: field.assessmentId || (typeof field.selectedAssessment === 'object' ? field.selectedAssessment.id : undefined), // ✅ Save assessmentId
                            ...(field.buttonName && { buttonName: field.buttonName }),
                            ...(assessmentCheckboxes.length > 0 && {
                                checkboxes: assessmentCheckboxes,
                            }),
                        };
                    case 'checkbox_item':
                        return {
                            type: 'CHECKBOX' as const,
                            name: field.name || field.label || 'Check Box',
                            haveButton: field.haveButton || false,
                            ...(field.buttonName && { buttonName: field.buttonName }),
                        };
                    case 'text_display':
                        return {
                            type: 'TEXT_DISPLAY' as const,
                            name: field.name || field.label || '',
                        };
                    case 'button':
                        return {
                            type: 'BUTTON' as const,
                            name: field.name || field.label || 'Action Button',
                            linkUrl: field.linkUrl || '',
                        };
                    case 'digital_signature':
                        return {
                            type: 'SIGNATURE' as const,
                            name: field.fieldName || 'Digital Signature',
                            placeHolder: field.placeholderText || 'Sign here using your finger',
                            buttonName: field.clearButtonLabel || 'Clear',
                            required: !!field.required,
                            showOnCard: !!field.showOnInfoCard,
                        };
                    case 'section':
                        const sectionCheckboxes = [
                            field.showDuplicateButton && {
                                type: 'CHECKBOX' as const,
                                name: field.name || 'Section',
                                haveButton: true,
                                buttonName: field.buttonName || 'Add section steps',
                            },
                        ].filter(Boolean) as RoadmapExtra[];

                        const sectionFields = nestedFields
                            .map((nestedField) => {
                                switch (nestedField.type) {
                                    case 'text':
                                        return {
                                            type: 'TEXT_FIELD' as const,
                                            name: nestedField.label || 'Text Field',
                                            ...(nestedField.placeholder && {
                                                placeHolder: nestedField.placeholder,
                                            }),
                                        };
                                    case 'textarea':
                                        return {
                                            type: 'TEXT_AREA' as const,
                                            name: nestedField.label || 'Text Area',
                                            ...(nestedField.placeholder && {
                                                placeHolder: nestedField.placeholder,
                                            }),
                                        };
                                    case 'assessment':
                                        const assessmentCheckboxes = [
                                            nestedField.scheduleMeeting && {
                                                type: 'CHECKBOX' as const,
                                                name: 'Schedule Meeting after the Assessment',
                                                haveButton: false,
                                            },
                                        ].filter(Boolean) as RoadmapExtra[];

                                        return {
                                            type: 'ASSESSMENT' as const,
                                            name: typeof nestedField.selectedAssessment === 'object'
                                                ? nestedField.selectedAssessment.name
                                                : (nestedField.selectedAssessment || 'Assessment'),
                                            assessmentId: nestedField.assessmentId || (typeof nestedField.selectedAssessment === 'object' ? nestedField.selectedAssessment.id : undefined),
                                            ...(nestedField.buttonName && { buttonName: nestedField.buttonName }),
                                            ...(assessmentCheckboxes.length > 0 && {
                                                checkboxes: assessmentCheckboxes,
                                            }),
                                        };
                                    case 'upload':
                                        return {
                                            type: 'UPLOAD' as const,
                                            name: nestedField.buttonLabel || 'Upload',
                                        };
                                    case 'datepicker':
                                        const dateCheckboxes = [
                                            nestedField.allowPastorSelect && {
                                                type: 'CHECKBOX' as const,
                                                name: 'Allow pastor to select Date',
                                                haveButton: false,
                                            },
                                            nestedField.showOnCard && {
                                                type: 'CHECKBOX' as const,
                                                name: 'Show date on info card',
                                                haveButton: false,
                                            },
                                        ].filter(Boolean) as RoadmapExtra[];

                                        return {
                                            type: 'DATE_PICKER' as const,
                                            name: nestedField.label || 'Date',
                                            ...(nestedField.date && {
                                                date: new Date(nestedField.date).toISOString().split('T')[0],
                                            }),
                                            ...(nestedField.buttonName && { buttonName: nestedField.buttonName }),
                                            ...(dateCheckboxes.length > 0 && { checkboxes: dateCheckboxes }),
                                        };
                                    case 'checkbox_item':
                                        return {
                                            type: 'CHECKBOX' as const,
                                            name: nestedField.name || nestedField.label || 'Check Box',
                                            haveButton: nestedField.haveButton || false,
                                            ...(nestedField.buttonName && { buttonName: nestedField.buttonName }),
                                        };
                                    case 'text_display':
                                        return {
                                            type: 'TEXT_DISPLAY' as const,
                                            name: nestedField.name || nestedField.label || '',
                                        };
                                    case 'button':
                                        return {
                                            type: 'BUTTON' as const,
                                            name: nestedField.name || nestedField.label || 'Action Button',
                                            linkUrl: nestedField.linkUrl || '',
                                        };
                                    default:
                                        return null;
                                }
                            })
                            .filter(Boolean) as RoadmapExtra[];

                        return {
                            type: 'SECTION' as const,
                            name: field.name || 'Section',
                            ...(field.buttonName && { buttonName: field.buttonName }),
                            ...(sectionCheckboxes.length > 0 && { checkboxes: sectionCheckboxes }),
                            ...(sectionFields.length > 0 && { sections: sectionFields }),
                        };
                    default:
                        return null;
                }
            })
            .filter(Boolean) as RoadmapExtra[];
    };

    // ✅ Load form data when editing (extras live on nested roadmap: roadmap.roadmaps[n].extras)
    useEffect(() => {
        if (isEditMode && parentRoadmap) {
            const selectedRoadmap =
                roadmapType === 'phase' && nestedRoadmapId
                    ? parentRoadmap.roadmaps?.find((r) => r._id === nestedRoadmapId)
                    : parentRoadmap.roadmaps?.[0];

            const extras = selectedRoadmap?.extras ?? [];

            if (selectedRoadmap) {
                setFormData({
                    churchVerbiage: selectedRoadmap.roadMapDetails || '',
                    descriptionVerbiage: selectedRoadmap.description || '',
                    customFields: transformExtrasToFields(extras),
                });
            }
        }
    }, [isEditMode, parentRoadmap, nestedRoadmapId, roadmapType]);

    // ✅ Menu items for field types
    const fieldTypeMenuItems: MenuItem[] = [
        {
            id: 'text',
            label: 'Text Field',
            icon: 'text-outline',
            onPress: () => handleFieldTypeSelect('text'),
        },
        {
            id: 'textarea',
            label: 'Text Area',
            icon: 'document-text-outline',
            onPress: () => handleFieldTypeSelect('textarea'),
        },
        {
            id: 'upload',
            label: 'Upload Button',
            icon: 'cloud-upload-outline',
            onPress: () => handleFieldTypeSelect('upload'),
        },
        {
            id: 'datepicker',
            label: 'Date Picker',
            icon: 'calendar-outline',
            onPress: () => handleFieldTypeSelect('datepicker'),
        },
        {
            id: 'section',
            label: 'Section',
            icon: 'grid-outline',
            onPress: () => handleFieldTypeSelect('section'),
        },
        {
            id: 'assessment',
            label: 'Assessment',
            icon: 'document-outline',
            onPress: () => handleFieldTypeSelect('assessment'),
        },
        {
            id: 'checkbox_item',
            label: 'Check Box',
            icon: 'checkbox-outline',
            onPress: () => handleFieldTypeSelect('checkbox_item'),
        },
        {
            id: 'text_display',
            label: 'Text Display',
            icon: 'text-outline',
            onPress: () => handleFieldTypeSelect('text_display'),
        },
        // {
        //     id: 'button',
        //     label: 'Action Button',
        //     icon: 'radio-button-on-outline',
        //     onPress: () => handleFieldTypeSelect('button'),
        // },
        {
            id: 'digital_signature',
            label: 'Digital Signature',
            icon: 'pencil-outline',
            onPress: () => handleFieldTypeSelect('digital_signature'),
        },
    ];

    // ✅ Field handlers
    const handleAddField = () => {
        if (addFieldButtonRef.current) {
            addFieldButtonRef.current.measure(
                (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                    const screenHeight = Dimensions.get('window').height;
                    setMenuPosition({
                        bottom: screenHeight - pageY -60,
                        right: 16,
                    });
                    setMenuVisible(true);
                }
            );
        } else {
            setMenuVisible(true);
        }
    };

    const handleAddNestedField = (sectionId: string) => {
        setCurrentSectionId(sectionId);
        setMenuPosition({ top: 0, right: 16 });
        setMenuVisible(true);
    };

    const handleFieldTypeSelect = (fieldType: FieldType) => {
        setMenuVisible(false);
        setTimeout(() => {
            addFieldSheet?.open(fieldType);
        }, 300);
    };

    const handleEditField = (fieldId: string) => {
        const field = formData.customFields.find((f) => f.id === fieldId);
        if (field) {
            setEditingFieldId(fieldId);
            addFieldSheet?.open(field.type, field);
        }
    };

    const handleDeleteField = (fieldId: string) => {
        const hasNestedFields = formData.customFields.some((f) => f.parentSectionId === fieldId);

        Alert.alert(
            'Delete Field',
            hasNestedFields
                ? 'This section contains fields. Deleting it will also delete all nested fields. Continue?'
                : 'Are you sure you want to delete this field?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setFormData((prev) => ({
                            ...prev,
                            customFields: prev.customFields.filter(
                                (f) => f.id !== fieldId && f.parentSectionId !== fieldId
                            ),
                        }));
                    },
                },
            ]
        );
    };

    const handleFieldInsert = (result: any) => {
        const { type, data } = result;

        let processedData = { ...data };

        // ✅ Extract assessmentId from selectedAssessment object if applicable
        if (type === 'assessment') {
            if (!processedData.selectedAssessment) {
                processedData.selectedAssessment = 'Assessment';
            } else if (typeof processedData.selectedAssessment === 'object') {
                
                console.log("----------------------------------------------")
                console.log("----------------------------------------------")
                console.log('processedData', processedData);
                console.log("----------------------------------------------")
                console.log("----------------------------------------------")
                console.log('selectedAssessment', processedData.selectedAssessment);
                console.log("----------------------------------------------")
                console.log("----------------------------------------------")
                processedData.assessmentId = processedData.selectedAssessment.id;
                console.log('processedData.assessmentId', processedData);
            }
            if (!processedData.buttonName) {
                processedData.buttonName = 'Take Assessment';
            }
        }

        if (editingFieldId) {
            setFormData((prev) => ({
                ...prev,
                customFields: prev.customFields.map((f) =>
                    f.id === editingFieldId ? { ...f, ...processedData, type } : f
                ),
            }));
            setEditingFieldId(null);
            return;
        }

        // ✅ Set default values based on field type
        const newField: any = {
            id: `field_${Date.now()}`,
            type: type,
            parentSectionId: currentSectionId,
            ...processedData,
        };

        // ✅ Add default date if datepicker and no date provided
        if (type === 'datepicker' && !newField.date) {
            newField.date = new Date();
        }

        setFormData((prev) => ({
            ...prev,
            customFields: [...prev.customFields, newField],
        }));

        setCurrentSectionId(null);
    };

    useEffect(() => {
        if (!addFieldSheet) return;
        addFieldSheet.registerHandlers({
            onInsert: handleFieldInsert,
            onClose: () => setEditingFieldId(null),
        });
        return () => addFieldSheet.registerHandlers(null);
    }, [addFieldSheet, handleFieldInsert]);

    // ✅ SUBMIT HANDLER
    const handleSubmit = async () => {
        if (!formData.churchVerbiage.trim() || !formData.descriptionVerbiage.trim()) {
            Alert.alert('Validation Error', 'Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        console.log("----------------------------------------------")

        try {
            const extras = transformFieldsToExtras(formData.customFields);
            console.log('Final extras to send:', JSON.stringify(extras, null, 2));
          
            // ✅ CASE 1: Single Roadmap
            console.log("----------------------------------------------")
            if (roadmapType === 'single') {
                const hasNested = parentRoadmap?.roadmaps && parentRoadmap.roadmaps.length > 0;

                if (!hasNested && !isEditMode) {
                    const safeDuration = roadmapData.completionTime || parentRoadmap?.duration || '1 month';
                    const payload: CreateNestedRoadmapRequest = {
                        name: roadmapData.name,
                        roadMapDetails: roadmapData.subheading,
                        description: formData.descriptionVerbiage,
                        duration: safeDuration,
                        ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
                        ...(roadmapData.selectedDivision && {
                            phase: roadmapData.selectedDivision,
                        }),
                        status: 'not started',
                        extras,
                    };
                    console.log('payload (create nested)----->', payload);
                    await createNestedMutation.mutateAsync({ roadmapId, payload });
                    Alert.alert('Success', 'Roadmap created successfully!', [
                        { text: 'OK', onPress: () => router.back() },
                    ]);
                } else {
                    const nested = parentRoadmap?.roadmaps?.[0];
                    const safeDuration = roadmapData.completionTime || nested?.duration || parentRoadmap?.duration || '1 month';
                    const updatedNested = {
                        _id: nested?._id,
                        name: roadmapData.name,
                        roadMapDetails: roadmapData.subheading,
                        description: formData.descriptionVerbiage,
                        duration: safeDuration,
                        ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
                        phase: roadmapData.selectedDivision || nested?.phase || '',
                        extras,
                        status: nested?.status || 'not started',
                        meetings: nested?.meetings || [],
                    };
                    console.log('updatedNested (update single)----->', updatedNested);
                    await updateRoadmapMutation.mutateAsync({
                        roadmapId,
                        payload: {
                            name: parentRoadmap?.name || roadmapData.name,
                            roadmaps: [updatedNested],
                            ...(parentRoadmap?.divisions && { divisions: parentRoadmap.divisions }),
                        },
                    });

                    Alert.alert('Success', 'Roadmap updated successfully!', [
                        { text: 'OK', onPress: () => router.back() },
                    ]);
                }
            }
            // ✅ CASE 2: Phase Roadmap
            else if (roadmapType === 'phase') {
              
                if (!isEditMode) {
                    const safeDuration = roadmapData.completionTime || parentRoadmap?.duration || '1 month';
                    const payload: CreateNestedRoadmapRequest = {
                        name: roadmapData.name,
                        roadMapDetails: roadmapData.subheading,
                        description: formData.descriptionVerbiage,
                        duration: safeDuration,
                        ...(roadmapData.bannerImage && { imageUrl: roadmapData.bannerImage }),
                        ...(roadmapData.selectedDivision && {
                            phase: roadmapData.selectedDivision,
                        }),
                        status: 'not started',
                        extras,
                    };
                    console.log('payload (create phase)----->', payload);

                    await createNestedMutation.mutateAsync({ roadmapId, payload });
                    Alert.alert('Success', 'Phase created successfully!', [
                        // @ts-ignore
                        { text: 'OK', onPress: () => navigation.pop(2) },
                    ]);
                } else {
                    const updatedRoadmaps =
                        parentRoadmap?.roadmaps?.map((nested: any) => {
                            if (nested._id === nestedRoadmapId) {
                                const safeDuration = roadmapData.completionTime || nested.duration || parentRoadmap?.duration || '1 month';
                                return {
                                    _id: nested._id,
                                    name: roadmapData.name,
                                    roadMapDetails: roadmapData.subheading,
                                    description: formData.descriptionVerbiage,
                                    duration: safeDuration,
                                    ...(roadmapData.bannerImage && {
                                        imageUrl: roadmapData.bannerImage,
                                    }),
                                    phase: roadmapData.selectedDivision || nested.phase || '',
                                    extras,
                                    status: nested.status || 'not started',
                                    meetings: nested.meetings || [],
                                };
                            }
                            return nested;
                        }) || [];
                    console.log('updatedRoadmaps (update phase)----->', updatedRoadmaps);
                    await updateRoadmapMutation.mutateAsync({
                        roadmapId,
                        payload: {
                            name: parentRoadmap?.name || roadmapData.name,
                            roadmaps: updatedRoadmaps,
                            ...(parentRoadmap?.divisions && { divisions: parentRoadmap.divisions }),
                        },
                    });

                    Alert.alert('Success', 'Phase updated successfully!', [
                        // @ts-ignore
                        { text: 'OK', onPress: () => navigation.pop(2) },
                    ]);
                }
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save roadmap');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    // ✅ Render fields with all renderers
    const renderField = (field: any) => {
        console.log('Rendering field:', field);
        switch (field.type) {
            case 'text':
                return (
                    <TextFieldRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'textarea':
                return (
                    <TextAreaRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'upload':
                return (
                    <UploadButtonRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'datepicker':
                return (
                    <DatePickerRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                        onDateChange={handleDateChange}
                    />
                );
            case 'assessment':
                return (
                    <AssessmentRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'checkbox_item':
                return (
                    <CheckboxRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'text_display':
                return (
                    <TextDisplayRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'button':
                return (
                    <ButtonRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'digital_signature':
                return (
                    <DigitalSignatureRenderer
                        key={field.id}
                        field={field}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                    />
                );
            case 'section':
                const nestedFields = formData.customFields.filter(
                    (f) => f.parentSectionId === field.id
                );
                return (
                    <SectionRenderer
                        key={field.id}
                        field={field}
                        nestedFields={nestedFields}
                        onEdit={handleEditField}
                        onDelete={handleDeleteField}
                        onAddNestedField={() => handleAddNestedField(field.id)}
                        renderNestedField={(nestedField) => renderField(nestedField)}
                    />
                );
            default:
                return null;
        }
    };

    // ✅ Loading state
    if (isEditMode && isLoading) {
        return (
            <LinearGradient colors={['#1E3A6F', '#2C5282', '#3182CE']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading roadmap...</Text>
                </View>
            </LinearGradient>
        );
    }

    const handleBack = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
        >
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
                <TopBar showUserName />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                        <Text style={styles.headerTitle}>{
                            isEditMode ? 'Edit Roadmap' : 'Create Roadmap'}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.content, { paddingBottom: bottom + 40, flexGrow: 1 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                <RoadMapFormHeader
                    name={roadmapData.name}
                    subheading={roadmapData.subheading}
                    bannerImage={roadmapData.bannerImage}
                    division={roadmapData.selectedDivision}
                />

                <View style={styles.section}>
                    <Text style={styles.label}>Church Roadmap Verbiage</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Verbiage"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={formData.churchVerbiage}
                        onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, churchVerbiage: text }))
                        }
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Description Verbiage</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter Verbiage"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={formData.descriptionVerbiage}
                        onChangeText={(text) =>
                            setFormData((prev) => ({ ...prev, descriptionVerbiage: text }))
                        }
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Tasks & Custom Fields</Text>
                    {formData.customFields
                        .filter((f) => !f.parentSectionId)
                        .map(renderField)}
                </View>

                <View style={styles.insertFieldContainer}>
                    <Text style={styles.insertFieldText}>Insert Field</Text>
                    <TouchableOpacity
                        ref={addFieldButtonRef}
                        style={styles.inlineAddButton}
                        onPress={handleAddField}
                    >
                        <Ionicons name="add" size={18} color="#1A4882" />
                        <Text style={styles.inlineAddButtonText}>Add Field</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.inlineActionButtons, { paddingBottom: bottom + 20 }]}>
                    <TouchableOpacity
                        style={styles.imageStyleCancelButton}
                        onPress={handleCancel}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.imageStyleCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.imageStyleSubmitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.imageStyleSubmitText}>
                                {isEditMode ? 'Update Roadmap' : 'Create Roadmap'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
                </ScrollView>

                {/* Fixed Action Buttons */}

                {/* ✅ Custom Menu for Field Types */}
                <CustomMenu
                    visible={menuVisible}
                    items={fieldTypeMenuItems}
                    onClose={() => setMenuVisible(false)}
                    position={menuPosition}
                    backgroundColor="#fff"
                    borderRadius={12}
                    iconSize={22}
                    itemPadding={{ horizontal: 16, vertical: 14 }}
                    itemTextStyle={{ fontSize: 15, fontWeight: '600', color: '#1A4882' }}
                />
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)'
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    content: { paddingHorizontal: 16, paddingVertical: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', fontSize: 16, marginTop: 12 },
    section: { marginBottom: 20 },
    label: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    addFieldButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    addFieldText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    submitButton: {
        flex: 1,
        backgroundColor: '#7C3AED',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },

    insertFieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glass effect
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginTop: 20,
        marginBottom: 40,
    },
    insertFieldText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    inlineAddButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Solid-ish white button
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    inlineAddButtonText: {
        color: '#1A4882',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },

    // Bottom Action Buttons
    inlineActionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 16,
        marginTop: 10,
    },
    imageStyleCancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
        // Shadow for the "pop" effect
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    imageStyleCancelText: {
        color: '#1D548D',
        fontSize: 18,
        fontWeight: '600',
    },
    imageStyleSubmitButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    imageStyleSubmitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

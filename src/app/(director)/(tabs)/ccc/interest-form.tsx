
import ContextMenu, { MenuItem, TextIcon } from '@/components/Menu/CustomMenu';
import AddFieldSheet, { AddFieldSheetRef, FieldType } from '@/components/Sheets/AddFieldSheet';
import FormCheckbox from '@/components/Forms/FormCheckBox';
import FormDropdown from '@/components/Forms/FormDropDown';
import FormTextArea from '@/components/Forms/FormTextArea';
import FormTextField from '@/components/Forms/FormTextField';
import { FormField, FormSection, interestFormConfig } from '@/types/interest.types';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { JSX, useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterestFormConfig, useAddDynamicField, useRemoveDynamicField, useDeleteDynamicSection } from '@/hooks/useInterest';
import { DynamicFieldRequest } from '@/types/interest.types';

export default function InterestFormScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeMenuSection, setActiveMenuSection] = useState<string | null>(null);
    const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

    // static base layout - mark as static
    const [sections, setSections] = useState<FormSection[]>(
        interestFormConfig.map(section => ({
            ...section,
            isDynamic: false, // ✅ Mark static sections
            fields: section.fields.map(field => ({
                ...field,
                isStatic: true, // ✅ Mark static fields
                isDynamic: false,
            })),
        }))
    );

    const [formValues, setFormValues] = useState<Record<string, string | boolean>>(() => {
        const initialValues: Record<string, string | boolean> = {};
        interestFormConfig.forEach(section => {
            section.fields.forEach(field => {
                initialValues[field.id] = field.defaultValue;
            });
        });
        return initialValues;
    });

    const { data: backendConfig } = useInterestFormConfig();
    const addDynamicFieldMutation = useAddDynamicField();
    const removeDynamicFieldMutation = useRemoveDynamicField();
    const deleteDynamicSectionMutation = useDeleteDynamicSection();
    // merge dynamicFields returned from backend (once, e.g. after reload)
    useEffect(() => {
        if (!backendConfig?.dynamicFields?.length) return;

        setSections(prevSections => {
            const cloned = prevSections.map(s => ({ ...s, fields: [...s.fields] }));
            const newValues: Record<string, string | boolean> = {};

            const sectionMapping: Record<string, string> = {
                'personal': 'personal',
                'church': 'church',
                'ministry': 'other',
            };

            // ✅ Group fields by section to create sections if needed
            const fieldsBySection = new Map<string, typeof backendConfig.dynamicFields>();

            backendConfig.dynamicFields.forEach(field => {
                const sectionKey = field.section.toLowerCase();
                if (!fieldsBySection.has(sectionKey)) {
                    fieldsBySection.set(sectionKey, []);
                }
                fieldsBySection.get(sectionKey)!.push(field);
            });

            // Process each section
            fieldsBySection.forEach((fields, sectionKey) => {
                const mappedSectionId = sectionMapping[sectionKey];

                let targetIndex = -1;
                if (mappedSectionId) {
                    targetIndex = cloned.findIndex(s => s.id === mappedSectionId);
                }

                if (targetIndex === -1) {
                    // Try to find by various matches
                    targetIndex = cloned.findIndex(
                        s => s.id.includes(sectionKey) ||
                            s.title.toLowerCase().replace(/\s+/g, '_') === sectionKey
                    );
                }

                const targetSection = targetIndex >= 0 ? cloned[targetIndex] : null;

                // Process all fields for this section
                fields.forEach(field => {
                    const newField: FormField = {
                        id: field.fieldId,
                        type:
                            field.type === 'text_field'
                                ? 'text'
                                : field.type === 'text_area'
                                    ? 'textarea'
                                    : field.type === 'checkbox'
                                        ? 'checkbox'
                                        : field.type === 'select'
                                            ? 'dropdown'
                                            : 'text',
                        label: field.label,
                        placeholder: field.placeholder || field.label,
                        defaultValue: field.type === 'checkbox' ? false : '',
                        width: 'full',
                        options: field.options,
                        isDynamic: true,
                    };

                    newValues[newField.id] = newField.defaultValue;

                    if (targetSection) {
                        targetSection.fields.push(newField);
                    } else {
                        // ✅ Create new section for unmapped dynamic fields
                        const newSectionIndex = cloned.findIndex(
                            s => s.id === `section_${sectionKey}`
                        );

                        if (newSectionIndex >= 0) {
                            cloned[newSectionIndex].fields.push(newField);
                        } else {
                            cloned.push({
                                id: `section_${sectionKey}`,
                                title: field.section, // Use the original section name from backend
                                fields: [newField],
                                showAddMoreButton: false,
                                isDynamic: true,
                            });
                        }
                    }
                });
            });

            setFormValues(prev => ({ ...prev, ...newValues }));
            return cloned;
        });
    }, [backendConfig]);

    const addFieldSheetRef = useRef<AddFieldSheetRef>(null);

    const handleFieldInsert = (result: any) => {
        const { type, data } = result;

        // ✅ Handle section creation separately
        if (type === 'section') {
            handleCreateSection(data);
            return;
        }

        if (!targetSectionId) return;

        const targetSection = sections.find(s => s.id === targetSectionId);
        if (!targetSection) return;

        const getSectionNameForBackend = (sectionId: string): string => {
            const mapping: Record<string, string> = {
                'personal': 'personal',
                'church': 'church',
                'other': 'ministry',
            };

            // ✅ If it's a mapped static section, return the mapped name
            if (mapping[sectionId]) {
                return mapping[sectionId];
            }

            // ✅ For dynamic sections, extract the section name from the ID
            // Format: section_my_new_section_1234567890
            if (sectionId.startsWith('section_')) {
                // Remove 'section_' prefix and timestamp suffix
                const parts = sectionId.substring(8).split('_');
                // Remove the timestamp (last part if it's a number)
                if (parts.length > 0 && !isNaN(Number(parts[parts.length - 1]))) {
                    parts.pop();
                }
                return parts.join('_');
            }

            return sectionId;
        };
        const toBackendType = (t: FieldType): DynamicFieldRequest['type'] => {
            if (t === 'text') return 'text_field';
            if (t === 'textarea') return 'text_area';
            if (t === 'checkbox' || t === 'radio') return 'checkbox';
            return 'text_field';
        };

        const fieldLabel = (type === 'checkbox' || type === 'radio')
            ? (data.name || 'New Field')
            : (data.placeholder || data.label || 'New Field');

        const basePayload: DynamicFieldRequest = {
            fieldId: `field_${Date.now()}`,
            label: fieldLabel,
            type: toBackendType(type),
            placeholder: fieldLabel,
            required: !!data.required,
            order: (targetSection.fields.length || 0),
            section: getSectionNameForBackend(targetSection.id),
            options:
                (type === 'checkbox' || type === 'radio' || type === 'select') &&
                    Array.isArray(data.choices)
                    ? data.choices.filter((c: string) => c.trim())
                    : undefined,
        };

        addDynamicFieldMutation.mutate(basePayload, {
            onSuccess: (res) => {
                const allFields = res.data.fields;
                const field = allFields.find((f: any) => f.fieldId === basePayload.fieldId);

                if (!field) {
                    console.error("❌ Could not find newly added field in response");
                    return;
                }

                const newField: FormField = {
                    id: field.fieldId,
                    type:
                        field.type === 'text_field'
                            ? 'text'
                            : field.type === 'text_area'
                                ? 'textarea'
                                : field.type === 'checkbox'
                                    ? 'checkbox'
                                    : field.type === 'select'
                                        ? 'dropdown'
                                        : 'text',
                    label: field.label,
                    placeholder: field.placeholder || field.label,
                    defaultValue: field.type === 'checkbox' ? false : '',
                    width: 'full',
                    options: field.options,
                    isDynamic: true,
                };

                setSections(prev =>
                    prev.map(section =>
                        section.id === targetSectionId
                            ? { ...section, fields: [...section.fields, newField] }
                            : section,
                    ),
                );

                setFormValues(prev => ({
                    ...prev,
                    [newField.id]: newField.defaultValue,
                }));

                setTargetSectionId(null);
            },
            onError: (error: any) => {
                Alert.alert(
                    'Error',
                    error?.response?.data?.message || error?.message || 'Failed to add field',
                );
            },
        });
    };

    // ✅ NEW: Handle section creation
    const handleCreateSection = (data: any) => {
        if (!data.name?.trim()) return;

        const sectionName = data.name.trim();
        const sectionId = `section_${sectionName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;

        // Create new section in UI
        const newSection: FormSection = {
            id: sectionId,
            title: sectionName,
            fields: [],
            isDynamic: true,
            showAddMoreButton: !!data.addDuplicateButton, // ✅ From the sheet config
        };

        // Find the index of the section after which to insert
        const targetIndex = sections.findIndex(s => s.id === targetSectionId);

        setSections(prev => {
            const newSections = [...prev];
            if (targetIndex >= 0) {
                // Insert after the target section
                newSections.splice(targetIndex + 1, 0, newSection);
            } else {
                // If no target found, add at the end
                newSections.push(newSection);
            }
            return newSections;
        });

        setTargetSectionId(null);
        setActiveMenuSection(null);

        // Show success message
        Alert.alert(
            'Success',
            `Section "${sectionName}" created. You can now add fields to it.`,
            [{ text: 'OK' }]
        );
    };

    const handleMenuItemPress = (sectionId: string, type: FieldType) => {
        setTargetSectionId(sectionId);
        try {
            addFieldSheetRef.current?.open(type);
            setTimeout(() => {
                setActiveMenuSection(null);
            }, 300);
        } catch {
            setActiveMenuSection(null);
        }
    };

    const handleEdit = () => setIsEditMode(true);
    const handleCancel = () => setIsEditMode(false);
    const handleSaveChanges = () => {
        setIsEditMode(false);
    };

    const handleFieldChange = (fieldId: string, value: string | boolean) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleMenuPress = (sectionId: string) => {
        setActiveMenuSection(activeMenuSection === sectionId ? null : sectionId);
    };

    // ✅ Updated to only show delete for dynamic sections
    const getMenuItems = (section: FormSection): MenuItem[] => {
        const baseItems: MenuItem[] = [
            {
                id: 'add-text',
                label: 'Add Text Field',
                customIcon: <TextIcon text="Aa" />,
                onPress: () => handleMenuItemPress(section.id, 'text'),
            },
            {
                id: 'add-textarea',
                label: 'Add Text Area',
                icon: 'document-text-outline',
                onPress: () => handleMenuItemPress(section.id, 'textarea'),
            },
            {
                id: 'add-checkbox',
                label: 'Add Check Box',
                icon: 'checkbox-outline',
                onPress: () => handleMenuItemPress(section.id, 'checkbox'),
            },
            {
                id: 'add-radio',
                label: 'Add Radio Button',
                icon: 'radio-button-on-outline',
                onPress: () => handleMenuItemPress(section.id, 'radio'),
            },
            {
                id: 'add-section',
                label: 'Add New Section below',
                icon: 'apps-outline',
                onPress: () => handleMenuItemPress(section.id, 'section'),
                showDividerAfter: true,
            },
        ];

        // ✅ Only add delete option for dynamic sections
        if (section.isDynamic) {
            baseItems.push({
                id: 'delete-section',
                label: 'Delete this Section',
                icon: 'trash-outline',
                onPress: () => handleDeleteSection(section.id),
                textColor: '#DC2626',
            });
        }

        return baseItems;
    };

    const handleDeleteSection = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);

        if (!section) return;

        // ✅ Check if section is dynamic
        if (!section.isDynamic) {
            Alert.alert(
                'Cannot Delete',
                'Static sections cannot be deleted.',
                [{ text: 'OK' }]
            );
            return;
        }

        // ✅ Get all dynamic field IDs in this section
        const dynamicFieldIds = section.fields
            .filter(field => field.isDynamic)
            .map(field => field.id);

        const message = dynamicFieldIds.length > 0
            ? `This will delete the section "${section.title}" and ${dynamicFieldIds.length} field(s). This action cannot be undone.`
            : `This will delete the section "${section.title}". This action cannot be undone.`;

        Alert.alert(
            'Delete Section',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // ✅ First remove from UI for immediate feedback
                        setSections(prevSections => prevSections.filter(s => s.id !== sectionId));
                        setActiveMenuSection(null);

                        // ✅ Then delete all dynamic fields from backend
                        if (dynamicFieldIds.length > 0) {
                            try {
                                await deleteDynamicSectionMutation.mutateAsync(dynamicFieldIds);
                                // Success - fields are already removed from UI
                            } catch (error: any) {
                                // ✅ If backend deletion fails, restore the section
                                Alert.alert(
                                    'Error',
                                    error?.message || 'Failed to delete section from server. Please try again.',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () => {
                                                // Restore section by refetching from backend
                                                // This will trigger the useEffect and restore the section
                                                window.location.reload(); // Or use a refetch method
                                            }
                                        }
                                    ]
                                );
                            }
                        }
                    },
                },
            ]
        );
    };

    // ✅ Add handler for deleting dynamic fields
    const handleDeleteField = (fieldId: string) => {
        Alert.alert(
            'Delete Field',
            'Are you sure you want to delete this field?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setSections(prev =>
                            prev.map(section => ({
                                ...section,
                                fields: section.fields.filter(f => f.id !== fieldId),
                            }))
                        );
                        // TODO: Call API to delete from backend
                        removeDynamicFieldMutation.mutate(fieldId);
                    },
                },
            ]
        );
    };

    const renderField = (field: FormField) => {
        const value = formValues[field.id];

        switch (field.type) {
            case 'text':
                return (
                    <View style={{ position: 'relative' }}>
                        <FormTextField
                            value={value as string}
                            placeholder={field.placeholder}
                            onChangeText={text => handleFieldChange(field.id, text)}
                            isEditMode={isEditMode}
                            showClearButton={field.showClearButton}
                            keyboardType={field.keyboardType}
                        />
                        {/* ✅ Show delete icon for dynamic fields in edit mode */}
                        {isEditMode && field.isDynamic && (
                            <TouchableOpacity
                                style={styles.fieldDeleteIcon}
                                onPress={() => handleDeleteField(field.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            case 'textarea':
                return (
                    <View key={field.id} style={{ position: 'relative' }}>
                        <FormTextArea
                            value={value as string}
                            placeholder={field.placeholder}
                            onChangeText={text => handleFieldChange(field.id, text)}
                            isEditMode={isEditMode}
                        />
                        {isEditMode && field.isDynamic && (
                            <TouchableOpacity
                                style={styles.fieldDeleteIcon}
                                onPress={() => handleDeleteField(field.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            case 'checkbox':
                return (
                    <View key={field.id} style={{ position: 'relative' }}>
                        <FormCheckbox
                            label={field.label}
                            value={value as boolean}
                            onToggle={() => handleFieldChange(field.id, !value)}
                            isEditMode={isEditMode}
                        />
                        {isEditMode && field.isDynamic && (
                            <TouchableOpacity
                                style={[styles.fieldDeleteIcon, { top: 8 }]}
                                onPress={() => handleDeleteField(field.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            case 'dropdown':
                return (
                    <View key={field.id} style={{ position: 'relative' }}>
                        <FormDropdown
                            value={value as string}
                            placeholder={field.placeholder}
                            onPress={() => { }}
                            isEditMode={isEditMode}
                        />
                        {isEditMode && field.isDynamic && (
                            <TouchableOpacity
                                style={styles.fieldDeleteIcon}
                                onPress={() => handleDeleteField(field.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                            </TouchableOpacity>
                        )}
                    </View>
                );
            default:
                return null;
        }
    };

    const renderFields = (fields: FormField[]) => {
        const rows: JSX.Element[] = [];
        let currentRow: FormField[] = [];

        fields.forEach((field, index) => {
            if (field.type === 'checkbox') {
                if (currentRow.length > 0) {
                    rows.push(
                        <View key={`row-${index}`} style={styles.row}>
                            {currentRow.map(f => (
                                <View key={f.id} style={styles.halfWidth}>
                                    {renderField(f)}
                                </View>
                            ))}
                        </View>,
                    );
                    currentRow = [];
                }
                return;
            }

            if (field.width === 'full') {
                if (currentRow.length > 0) {
                    rows.push(
                        <View key={`row-${index}`} style={styles.row}>
                            {currentRow.map(f => (
                                <View key={f.id} style={styles.halfWidth}>
                                    {renderField(f)}
                                </View>
                            ))}
                        </View>,
                    );
                    currentRow = [];
                }
                const el = renderField(field);
                if (el) rows.push(el);
            } else {
                currentRow.push(field);
                if (currentRow.length === 2) {
                    rows.push(
                        <View key={`row-${index}`} style={styles.row}>
                            {currentRow.map(f => (
                                <View key={f.id} style={styles.halfWidth}>
                                    {renderField(f)}
                                </View>
                            ))}
                        </View>,
                    );
                    currentRow = [];
                }
            }
        });

        if (currentRow.length > 0) {
            rows.push(
                <View key="last-row" style={styles.row}>
                    {currentRow.map(f => (
                        <View key={f.id} style={styles.halfWidth}>
                            {renderField(f)}
                        </View>
                    ))}
                </View>,
            );
        }

        return rows;
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: bottom + 120, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {isEditMode ? 'Edit - Interest Form' : 'Interest Form'}
                        </Text>
                    </View>

                    {sections.map((section, sectionIndex) => {
                        const checkboxFields = section.fields.filter(f => f.type === 'checkbox');
                        const otherFields = section.fields.filter(f => f.type !== 'checkbox');

                        return (
                            <React.Fragment key={section.id}>
                                {isEditMode ? (
                                    <View style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionTitleEdit}>{section.title}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleMenuPress(section.id)}
                                                hitSlop={10}
                                            >
                                                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* ✅ Pass section instead of section.id */}
                                        <ContextMenu
                                            visible={activeMenuSection === section.id}
                                            items={getMenuItems(section)}
                                            onClose={() => setActiveMenuSection(null)}
                                            position={{ top: 50, right: 16 }}
                                            minWidth={250}
                                        />

                                        <View style={styles.sectionContent}>
                                            {renderFields(otherFields)}

                                            {checkboxFields.length > 0 && (
                                                <>
                                                    <View style={[styles.interestsHeader, { marginBottom: 0 }]}>
                                                        <Text style={styles.interestsHeaderText}>Interests</Text>
                                                        <Ionicons name="chevron-down" size={20} color="#fff" />
                                                    </View>
                                                    <View style={styles.interestsContainer}>
                                                        {checkboxFields.map((field, index) => (
                                                            <View key={field.id} style={index === checkboxFields.length - 1 ? {} : { marginBottom: 20 }}>
                                                                {renderField(field)}
                                                            </View>
                                                        ))}
                                                    </View>
                                                </>
                                            )}

                                            {section.showAddMoreButton && (
                                                <TouchableOpacity style={styles.addMoreButton}>
                                                    <Text style={styles.addMoreButtonText}>Add More Church</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>{section.title}</Text>
                                        {renderFields(otherFields)}

                                        {checkboxFields.length > 0 && (
                                            <>
                                                <View style={[styles.interestsHeader, { marginBottom: 0 }]}>
                                                    <Text style={styles.interestsHeaderText}>Interests</Text>
                                                    <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.6)" />
                                                </View>
                                                <View style={styles.interestsContainer}>
                                                    {checkboxFields.map((field, index) => (
                                                        <View key={field.id} style={index === checkboxFields.length - 1 ? {} : { marginBottom: 20 }}>
                                                            {renderField(field)}
                                                        </View>
                                                    ))}
                                                </View>
                                            </>
                                        )}

                                        {section.showAddMoreButton && (
                                            <TouchableOpacity style={styles.addMoreButton}>
                                                <Text style={styles.addMoreButtonText}>Add More Church</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                                {!isEditMode && sectionIndex < sections.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </ScrollView>

                {isEditMode ? (
                    <View style={[styles.bottomButtons, { paddingBottom: bottom + 20 }]}>
                        <Pressable style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={[styles.bottomContainer, { paddingBottom: bottom + 20 }]}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Feather name="edit" size={20} color="#ffffff" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>

            <AddFieldSheet
                ref={addFieldSheetRef}
                onInsert={handleFieldInsert}
                onClose={() => {
                    addFieldSheetRef.current?.dismiss();
                }}
            />
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 20,
    },
    headerTitle: {
        marginLeft: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },

    // VIEW MODE STYLES
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    interestsContainer: {
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 16,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 4,
        marginHorizontal: 16,
    },

    // EDIT MODE STYLES
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 16,
        overflow: 'visible',
        position: 'relative',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitleEdit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    sectionContent: {
        padding: 16,
        paddingTop: 0,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    addMoreButton: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(26, 42, 89, 1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addMoreButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },

    // BOTTOM BUTTONS
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,1)',
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    bottomButtons: {
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#234487',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A4882',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(26, 42, 89, 1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },


    interestsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    interestsHeaderText: {
        fontSize: 15,
        color: '#fff',
    },
    fieldDeleteIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 6,
    },
});

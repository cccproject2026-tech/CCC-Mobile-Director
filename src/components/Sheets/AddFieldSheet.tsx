import AssessmentSelectionModal from "@/components/Modals/AssessmentSelectionModal";
import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type FieldType =
    | "text"
    | "textarea"
    | "checkbox"
    | "radio"
    | "section"
    | "upload"
    | "datepicker"
    | "assessment"
    | "checkbox_item"
    | "text_display"
    | "button";

export interface AddFieldSheetRef {
    present: () => void;
    dismiss: () => void;
    open: (type: FieldType, existingData?: any) => void;
}

interface AddFieldSheetProps {
    onInsert: (data: any) => void;
    onClose: () => void;
    showHeading?: boolean;
    showButton?: boolean;
}

const AddFieldSheet = forwardRef<AddFieldSheetRef, AddFieldSheetProps>(
    ({ onInsert, onClose, showHeading = false, showButton = false }, ref) => {
        const { bottom } = useSafeAreaInsets();
        const [fieldType, setFieldType] = useState<FieldType | null>(null);
        const [formData, setFormData] = useState<any>({});
        const bottomSheetRef = useRef<BottomSheetModal>(null);
        const scrollViewRef = useRef<any>(null);
        const contentAreaRef = useRef<View>(null);
        const layoutRef = useRef<{ contentAreaY: number; fields: Record<string, number> }>({ contentAreaY: 0, fields: {} });
        const [showAssessmentModal, setShowAssessmentModal] = useState(false);

        const scrollToFocusedField = useCallback((fieldKey: string) => {
            const contentY = layoutRef.current.contentAreaY ?? 0;
            const fieldY = layoutRef.current.fields[fieldKey] ?? 0;
            const scrollY = Math.max(0, contentY + fieldY - 80);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo?.({ y: scrollY, animated: true });
            }, 300);
        }, []);

        useEffect(() => {
            const sub = Keyboard.addListener("keyboardDidShow", () => {
                // Small delay so sheet has adjusted; scroll will be triggered by onFocus when needed
            });
            return () => sub.remove();
        }, []);

        console.log("AddFieldSheet component rendered, fieldType:", fieldType);

        const getConfig = () => {
            switch (fieldType) {
                case "text":
                case "textarea":
                    const fields: any[] = [];

                    // 1. ADD THE NAME/LABEL FIELD
                    fields.push({
                        key: "label", // Using 'name' to keep it consistent with other types
                        label: "Field Name",
                        placeholder: "Enter the label for this field",
                        type: "input",
                    });

                    // Add heading field if enabled
                    if (showHeading) {
                        fields.push({
                            key: "heading",
                            label: "Heading",
                            placeholder: "Enter Heading of the field",
                            type: "input",
                        });
                    }

                    // Add placeholder field
                    fields.push({
                        key: "placeholder",
                        label: "Place Holder",
                        placeholder: "Enter Place Holder",
                        type: "input",
                    });

                    // Add button field if enabled
                    if (showButton) {
                        fields.push({
                            key: "button",
                            label: "Button",
                            placeholder: "Enter Button Name",
                            type: "input",
                        });
                    }

                    return {
                        title: fieldType === "text" ? "Add Text Field" : "Add Text Area",
                        snapPoint: "90%",
                        fields,
                    };

                case "checkbox":
                case "radio":
                    return {
                        title: `Add ${fieldType === "checkbox" ? "Check Box" : "Radio Button"
                            }`,
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "name",
                                label: "Name",
                                placeholder: `Enter title of ${fieldType === "checkbox" ? "Check Box" : "Radio Button"
                                    }`,
                                type: "input",
                            },
                            {
                                key: "choices",
                                label: "Add Choices",
                                type: "choices",
                            },
                        ],
                    };
                case "section":
                    return {
                        title: "Add Section",
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "name",
                                label: "Name",
                                placeholder: "Enter Name of Section",
                                type: "input",
                            },
                            {
                                key: "addDuplicateButton",
                                label: "Add Button to duplicate this Section",
                                type: "checkbox",
                            },
                            {
                                key: "buttonName",
                                label: "Button Name",
                                placeholder: "Enter name of Button",
                                type: "input",
                                conditional: "addDuplicateButton",
                            },
                        ],
                    };
                case "upload":
                    return {
                        title: "Add Upload Button",
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "buttonName",
                                label: "Button",
                                placeholder: "Enter Upload Button Name",
                                type: "input",
                            },
                        ],
                    };
                case "datepicker":
                    return {
                        title: "Add Date Picker",
                        snapPoint: "65%",
                        fields: [
                            {
                                key: "label",
                                label: "Text",
                                placeholder: "Enter Text for the Date",
                                type: "input",
                            },
                            {
                                key: "allowPastorSelect",
                                label: "Allow Pastor to Select Date",
                                type: "checkbox",
                            },
                            {
                                key: "showOnCard",
                                label: "Show Date on Info card",
                                type: "checkbox",
                            },
                            {
                                key: "buttonName",
                                label: "Button",
                                placeholder: "Enter Button Name",
                                type: "input",
                            },
                        ],
                    };
                case "assessment":
                    return {
                        title: "Add Assessment",
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "importAssessment",
                                label: "Import Assessment",
                                placeholder: "Click here to Choose",
                                type: "import",
                            },
                            {
                                key: "buttonName",
                                label: "Button",
                                placeholder: "Enter Button Name",
                                type: "input",
                            },
                            {
                                key: "scheduleMeeting",
                                label: "Schedule Meeting after the Assessment",
                                type: "checkbox",
                            },
                        ],
                    };
                case "checkbox_item":
                    return {
                        title: "Add Check Box",
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "name",
                                label: "Name",
                                placeholder: "Enter name of Check Box",
                                type: "input",
                            },
                            // {
                            //     key: "haveButton",
                            //     label: "Add Action Button",
                            //     type: "checkbox",
                            // },
                            // {
                            //     key: "buttonName",
                            //     label: "Button Name",
                            //     placeholder: "Enter Button Label",
                            //     type: "input",
                            //     conditional: "haveButton",
                            // },
                        ],
                    };
                case "text_display":
                    return {
                        title: "Add Text Display",
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "name",
                                label: "Display Text",
                                placeholder: "Enter the text to display",
                                type: "input",
                            },
                        ],
                    };
                case "button":
                    return {
                        title: "Add Action Button",
                        snapPoint: "90%",
                        fields: [
                            {
                                key: "name",
                                label: "Button Label",
                                placeholder: "Enter the button label",
                                type: "input",
                            },
                        ],
                    };
                default:
                    return null;
            }
        };

        const config = getConfig();

        useEffect(() => {
            if (fieldType === "checkbox" || fieldType === "radio") {
                setFormData({ choices: ["", ""] });
            } else {
                setFormData({});
            }
        }, [fieldType]);

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

        const handleAddChoice = () => {
            setFormData({
                ...formData,
                choices: [...(formData.choices || []), ""],
            });
        };

        const handleChoiceChange = (index: number, value: string) => {
            const newChoices = [...formData.choices];
            newChoices[index] = value;
            setFormData({ ...formData, choices: newChoices });
        };

        const handleRemoveChoice = (index: number) => {
            if (formData.choices.length > 1) {
                const newChoices = formData.choices.filter(
                    (_: any, i: number) => i !== index
                );
                setFormData({ ...formData, choices: newChoices });
            }
        };

        const handleInsert = () => {
            let isValid = false;

            if (fieldType === "text" || fieldType === "textarea") {
                isValid = !!formData.placeholder?.trim();
            } else if (fieldType === "checkbox" || fieldType === "radio") {
                const validChoices = formData.choices?.filter((c: string) => c.trim());
                isValid = !!formData.name?.trim() && validChoices?.length > 0;
            } else if (fieldType === "section") {
                isValid = !!formData.name?.trim(); // ✅ Validate section name
            } else if (fieldType === "upload") {
                isValid = !!formData.buttonName?.trim();
            } else if (fieldType === "datepicker") {
                isValid = !!formData.label?.trim();
            } else if (fieldType === "assessment") {
                isValid = !!formData.selectedAssessment;
            } else if (fieldType === "checkbox_item") {
                isValid = !!formData.name?.trim();
            } else if (fieldType === "text_display") {
                isValid = !!formData.name?.trim();
            } else if (fieldType === "button") {
                isValid = !!formData.name?.trim();
            }

            if (isValid) {
                onInsert({ type: fieldType, data: formData });
                bottomSheetRef.current?.dismiss();
                setFormData({});
                setFieldType(null);
            }
        };
        const handleClear = () => {
            if (fieldType === "checkbox" || fieldType === "radio") {
                setFormData({ choices: ["", ""] });
            } else {
                setFormData({});
            }
        };

        const handleCancel = () => {
            bottomSheetRef.current?.dismiss();
            setFormData({});
            setFieldType(null);
        };

        const open = (type: FieldType, existingData?: any) => {
            console.log(
                "AddFieldSheet open method called with type:",
                type,
                "existingData:",
                existingData
            );
            setFieldType(type);
            if (existingData) {
                // Pre-fill form data for editing
                setFormData(existingData);
            }
            setTimeout(() => {
                try {
                    bottomSheetRef.current?.present();
                } catch (error) {
                    console.error("Error in bottomSheetRef.current.present():", error);
                }
            }, 100);
        };

        React.useImperativeHandle(ref, () => ({
            present: () => bottomSheetRef.current?.present(),
            dismiss: () => bottomSheetRef.current?.dismiss(),
            open,
        }));

        if (!config) {
            return null;
        }

        return (
            <>
                <BottomSheetModal
                    ref={bottomSheetRef}
                    snapPoints={[config.snapPoint]}
                    enablePanDownToClose
                    backdropComponent={renderBackdrop}
                    backgroundStyle={styles.bottomSheetBackground}
                    handleIndicatorStyle={styles.handleIndicator}
                    onDismiss={() => {
                        setFormData({});
                        setFieldType(null);
                        onClose();
                    }}
                    android_keyboardInputMode="adjustResize"
                    keyboardBehavior="interactive"
                    keyboardBlurBehavior="restore"
                >
                    <BottomSheetScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.contentContainer,
                            { paddingBottom: Math.max(bottom, 20) + 280 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View style={styles.headerSection}>
                            <Text style={styles.headerTitle}>{config.title}</Text>
                        </View>

                        {/* Content Area */}
                        <View
                            ref={contentAreaRef}
                            style={styles.contentArea}
                            onLayout={(e) => {
                                layoutRef.current.contentAreaY = e.nativeEvent.layout.y;
                            }}
                        >
                            {config.fields.map((field: any) => {
                                if (field.conditional && !formData[field.conditional]) {
                                    return null;
                                }

                                if (field.type === "input") {
                                    return (
                                        <View
                                            key={field.key}
                                            style={styles.fieldSection}
                                            onLayout={(e) => {
                                                layoutRef.current.fields[field.key] = e.nativeEvent.layout.y;
                                            }}
                                        >
                                            <Text style={styles.fieldLabel}>{field.label}</Text>
                                            <BottomSheetTextInput
                                                style={styles.textInput}
                                                placeholder={field.placeholder}
                                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                                value={formData[field.key] || ""}
                                                onChangeText={(text) =>
                                                    setFormData({ ...formData, [field.key]: text })
                                                }
                                                onFocus={() => scrollToFocusedField(field.key)}
                                            />
                                        </View>
                                    );
                                }

                                if (field.type === "import") {
                                    return (
                                        <View key={field.key} style={styles.fieldSection}>
                                            <Text style={styles.fieldLabel}>{field.label}</Text>
                                            {formData.selectedAssessment ? (
                                                <View style={styles.selectedItemBox}>
                                                    <Text style={styles.selectedItemText}>
                                                        Added{" "}
                                                        {formData.selectedAssessment.name ||
                                                            formData.selectedAssessment}
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            setFormData({
                                                                ...formData,
                                                                selectedAssessment: null,
                                                            })
                                                        }
                                                        style={styles.editIconButton}
                                                    >
                                                        <Ionicons
                                                            name="create-outline"
                                                            size={20}
                                                            color="#fff"
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.importButton}
                                                    onPress={() => setShowAssessmentModal(true)}
                                                >
                                                    <Text style={styles.importButtonText}>
                                                        {field.placeholder}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                }

                                if (field.type === "checkbox") {
                                    return (
                                        <View key={field.key} style={styles.fieldSection}>
                                            <TouchableOpacity
                                                style={styles.checkboxRow}
                                                onPress={() =>
                                                    setFormData({
                                                        ...formData,
                                                        [field.key]: !formData[field.key],
                                                    })
                                                }
                                            >
                                                <View
                                                    style={[
                                                        styles.checkbox,
                                                        formData[field.key] && styles.checkboxChecked,
                                                    ]}
                                                >
                                                    {formData[field.key] && (
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={16}
                                                            color="#1A4882"
                                                        />
                                                    )}
                                                </View>
                                                <Text style={styles.checkboxLabel}>{field.label}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }

                                if (field.type === "choices") {
                                    return (
                                        <View
                                            key={field.key}
                                            style={styles.fieldSection}
                                            onLayout={(e) => {
                                                layoutRef.current.fields[field.key] = e.nativeEvent.layout.y;
                                            }}
                                        >
                                            <Text style={styles.fieldLabel}>{field.label}</Text>
                                            {(formData.choices || []).map(
                                                (choice: string, index: number) => (
                                                    <View
                                                        key={index}
                                                        style={styles.choiceRow}
                                                        onLayout={(e) => {
                                                            const sectionY = layoutRef.current.fields[field.key] ?? 0;
                                                            layoutRef.current.fields[`${field.key}-${index}`] =
                                                                sectionY + e.nativeEvent.layout.y;
                                                        }}
                                                    >
                                                        <BottomSheetTextInput
                                                            style={[styles.textInput, styles.choiceInput]}
                                                            placeholder={`Enter Choice ${index + 1}`}
                                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                                            value={choice}
                                                            onChangeText={(text) =>
                                                                handleChoiceChange(index, text)
                                                            }
                                                            onFocus={() => scrollToFocusedField(`${field.key}-${index}`)}
                                                        />
                                                        {formData.choices.length > 1 && (
                                                            <TouchableOpacity
                                                                style={styles.removeButton}
                                                                onPress={() => handleRemoveChoice(index)}
                                                            >
                                                                <Ionicons
                                                                    name="close-circle"
                                                                    size={24}
                                                                    color="#fff"
                                                                />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                )
                                            )}
                                            <TouchableOpacity
                                                style={styles.addMoreButton}
                                                onPress={handleAddChoice}
                                            >
                                                <Ionicons
                                                    name="add-circle-outline"
                                                    size={20}
                                                    color="#fff"
                                                />
                                                <Text style={styles.addMoreText}>Add More</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }

                                return null;
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClear}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.insertButton}
                                onPress={handleInsert}
                            >
                                <Text style={styles.insertButtonText}>Insert</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetScrollView>
                </BottomSheetModal>

                <AssessmentSelectionModal
                    visible={showAssessmentModal}
                    onClose={() => setShowAssessmentModal(false)}
                    onSelect={(assessment) => {
                        console.log("----------------------------------------------")
                        console.log("----------------------------------------------")
                        console.log('assessment', assessment);
                        console.log("----------------------------------------------")
                        console.log("----------------------------------------------")
                        setFormData({
                            ...formData,
                            selectedAssessment: assessment,
                        });
                        setShowAssessmentModal(false);
                    }}
                />
            </>
        );
    }
);

AddFieldSheet.displayName = "AddFieldSheet";

export default AddFieldSheet;

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: "#1E2F5C",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicatorStyle: {
        backgroundColor: "rgba(255,255,255,0.4)",
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    headerSection: {
        alignItems: "center",
        marginBottom: 24,
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    contentArea: {
        flex: 1,
    },
    fieldSection: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#fff",
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.5)",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
        backgroundColor: "#fff",
        borderColor: "#fff",
    },
    checkboxLabel: {
        fontSize: 16,
        color: "#fff",
        flex: 1,
    },
    choiceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    choiceInput: {
        flex: 1,
        marginRight: 8,
    },
    removeButton: {
        padding: 4,
    },
    addMoreButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        marginTop: 8,
    },
    addMoreText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginLeft: 8,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    clearButton: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E3A6F",
    },
    insertButton: {
        flex: 1,
        backgroundColor: "rgba(30, 47, 92, 0.8)",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
    },
    insertButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    handleIndicator: {},
    importButton: {
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    importButtonText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },
    selectedItemBox: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectedItemText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "500",
        flex: 1,
    },
    editIconButton: {
        padding: 4,
    },
});

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import SearchBar from "../Header/SearchBar";
import { useAssessments } from "@/hooks/useAssessments";

export interface Assessment {
    id: string;
    name: string;
    type: string;
    description: string;
    image?: any;
}

interface AssessmentSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (assessment: Assessment) => void;
    assessments?: Assessment[];
}

const AssessmentSelectionModal: React.FC<AssessmentSelectionModalProps> = ({
    visible,
    onClose,
    onSelect,
    assessments: providedAssessments,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAssessment, setSelectedAssessment] =
        useState<Assessment | null>(null);

    const { data: apiAssessments, isLoading, isError, error } = useAssessments();

    const assessments = useMemo(() => {
        if (providedAssessments) return providedAssessments;
        if (!apiAssessments) return [];

        return apiAssessments.map(api => ({
            id: api._id,
            name: api.name,
            type: api.type || "PMP",
            description: api.description,
            image: api.bannerImage ? { uri: api.bannerImage } : undefined
        }));
    }, [providedAssessments, apiAssessments]);

    const filteredAssessments = assessments.filter(
        (assessment) =>
            assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assessment.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = () => {
        if (selectedAssessment) {
            onSelect(selectedAssessment);
            setSelectedAssessment(null);
            setSearchQuery("");
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedAssessment(null);
        setSearchQuery("");
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Choose Assessment</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeValue={setSearchQuery}
                        placeholder="Search"
                        backgroundColor="#14517D"
                    />
                </View>

                {/* Assessment List */}
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading assessments...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                        <Text style={styles.errorText}>Failed to load assessments</Text>
                    </View>
                ) : filteredAssessments.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.emptyText}>No assessments found</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        {filteredAssessments.map((assessment) => (
                            <TouchableOpacity
                                key={assessment.id}
                                style={styles.assessmentCard}
                                onPress={() => setSelectedAssessment(assessment)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.radioButton}>
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            selectedAssessment?.id === assessment.id &&
                                            styles.radioCircleSelected,
                                        ]}
                                    >
                                        {selectedAssessment?.id === assessment.id && (
                                            <View style={styles.radioInner} />
                                        )}
                                    </View>
                                </View>

                                <View style={styles.assessmentImageContainer}>
                                    {assessment.image ? (
                                        <Image
                                            source={assessment.image}
                                            style={styles.assessmentImage}
                                        />
                                    ) : (
                                        <View style={styles.assessmentPlaceholder}>
                                            <Text style={styles.assessmentType}>{assessment.type}</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.assessmentInfo}>
                                    <Text style={styles.assessmentName} numberOfLines={2}>
                                        {assessment.name}
                                    </Text>
                                    <Text style={styles.assessmentDescription} numberOfLines={2}>
                                        {assessment.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Bottom Bar with Selected Info and Select Button */}
                <View style={styles.bottomBar}>
                    <Text style={styles.selectedText} numberOfLines={1}>
                        {selectedAssessment?.name || "No assessment selected"}
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.selectButton,
                            !selectedAssessment && styles.selectButtonDisabled,
                        ]}
                        onPress={handleSelect}
                        disabled={!selectedAssessment}
                    >
                        <Text style={styles.selectButtonText}>Select</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#176192",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    assessmentCard: {
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
    },
    radioButton: {
        marginRight: 12,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    radioCircleSelected: {
        borderColor: "#4A90E2",
        backgroundColor: "#4A90E2",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    assessmentImageContainer: {
        marginRight: 12,
    },
    assessmentImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    assessmentPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#00ABAE",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "#BFFEFE",
    },
    assessmentType: {
        fontSize: 20,
        fontWeight: "800",
        color: "#001B4A",
    },
    assessmentInfo: {
        flex: 1,
    },
    assessmentName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 4,
    },
    assessmentDescription: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.7)",
        lineHeight: 18,
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#1E3A6F",
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    selectedText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        color: "#fff",
        marginRight: 12,
    },
    selectButton: {
        backgroundColor: "#4A90E2",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    selectButtonDisabled: {
        backgroundColor: "rgba(74, 144, 226, 0.5)",
    },
    selectButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        color: "#fff",
        marginTop: 12,
        fontSize: 16,
    },
    errorText: {
        color: "#FF6B6B",
        marginTop: 12,
        fontSize: 16,
        textAlign: "center",
    },
    emptyText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 16,
        textAlign: "center",
    },
});

export default AssessmentSelectionModal;

import { Scholarship } from "@/types/scholorship.types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

interface ScholarshipCardProps {
    scholarship: Scholarship;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEditPress: () => void;
    isFirst?: boolean;
}

export default function ScholarshipCard({
    scholarship,
    isExpanded,
    onToggleExpand,
    onEditPress,
    isFirst = false,
}: ScholarshipCardProps) {
    const amount = scholarship.amount ?? 0;
    const totalAmount = scholarship.totalAmount ?? 0;
    const totalAwards = scholarship.numberOfAwards ?? 0;

    return (
        <View
            style={{
                backgroundColor: isFirst
                    ? "rgba(255, 255, 255, 0.25)"
                    : "rgba(255, 255, 255, 0.15)",
                borderRadius: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.3)",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <Pressable
                onPress={onToggleExpand}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#fff",
                    }}
                >
                    {scholarship.type}
                </Text>
                <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#fff"
                />
            </Pressable>

            {/* Expanded Content */}
            {isExpanded && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                    {/* Amount */}
                    <Text
                        style={{
                            fontSize: 15,
                            color: "#fff",
                            marginBottom: 8,
                        }}
                    >
                        <Text style={{ fontWeight: "400" }}>Amount of Scholarship : </Text>
                        <Text style={{ fontWeight: "700", color: "#FFC107" }}>
                            ${amount}
                        </Text>
                    </Text>

                    {/* Total Money Awarded */}
                    <Text
                        style={{
                            fontSize: 15,
                            color: "#fff",
                            marginBottom: 8,
                        }}
                    >
                        <Text style={{ fontWeight: "400" }}>
                            Total Money Awarded so far :{" "}
                        </Text>
                        <Text style={{ fontWeight: "700", color: "#FFC107" }}>
                            ${totalAmount}
                        </Text>
                    </Text>

                    {/* Total Mentees */}
                    <Text
                        style={{
                            fontSize: 15,
                            color: "#fff",
                            marginBottom: 20,
                        }}
                    >
                        <Text style={{ fontWeight: "400" }}>
                            Total Number of Mentees Awarded :{" "}
                        </Text>
                        <Text style={{ fontWeight: "700", color: "#FFC107" }}>
                            {totalAwards}
                        </Text>
                    </Text>

                    {/* Edit Button */}
                    <TouchableOpacity
                        onPress={onEditPress}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 10,
                            alignSelf: "flex-start",
                            gap: 8,
                        }}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#fff",
                            }}
                        >
                            Edit
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

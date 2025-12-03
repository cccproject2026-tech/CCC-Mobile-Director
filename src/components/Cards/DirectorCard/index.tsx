import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type DirectorCardProps = {
    data: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    onEdit: () => void;
    onDelete: () => void;
};
export default function DirectorCard({ data, onEdit, onDelete }: DirectorCardProps) {
    const name = `${data.firstName} ${data.lastName}`;

    return (
        <View style={styles.card}>
            <View style={styles.left}>
                <Ionicons name="person-outline" size={26} color="#fff" />
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.email}>{data.email}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity onPress={onEdit}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={{ marginLeft: 12 }}>
                    <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1A4882",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    left: { flexDirection: "row", alignItems: "center" },
    name: { color: "#fff", fontSize: 16, fontWeight: "600" },
    email: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
    actions: { flexDirection: "row" },
});

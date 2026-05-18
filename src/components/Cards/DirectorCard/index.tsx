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
                <View style={styles.avatar}>
                    <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.85)" />
                </View>
                <View>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.email}>{data.email}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
                    <Ionicons name="create-outline" size={18} color="rgba(255,255,255,0.85)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
                    <Ionicons name="trash-outline" size={18} color="#F87171" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    left: { flexDirection: "row", alignItems: "center", flex: 1 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    name: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: -0.1 },
    email: { color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 },
    actions: { flexDirection: "row", gap: 4 },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
        alignItems: "center",
        justifyContent: "center",
    },
});

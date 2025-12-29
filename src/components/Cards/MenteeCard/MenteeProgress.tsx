import { View, Text } from "react-native";
import { styles } from "./styles";
import { Mentee } from "@/types/user.types";

export default function MenteeProgress({ data }: { data: Mentee }) {
    if (!data.progress) return null;
    return (
        <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${data.progress}%` }]} />
            </View>

            <Text style={styles.progressText}>{data.progress}%</Text>
        </View>
    );
}

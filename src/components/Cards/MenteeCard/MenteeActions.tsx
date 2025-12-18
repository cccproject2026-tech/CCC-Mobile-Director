import { TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { Mentee } from "@/types/user.types";

interface ActionProps {
    onMarkComplete?: () => void;
    onIssueCertificate?: () => void;
    onInviteAsFieldMentor?: () => void;
    data?: Mentee;
}

export default function MenteeActions({ onMarkComplete, onIssueCertificate, onInviteAsFieldMentor, data }: ActionProps) {

    // completed but no certificate yet
    if (onIssueCertificate && data?.hasCompleted && !data?.hasIssuedCertificate)
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onIssueCertificate}>
                    <Text style={styles.btnTxt}>Issue Certificate</Text>
                </TouchableOpacity>
            </LinearGradient>
        );

    // certificate issued but not field mentor
    if (data?.hasCompleted && data?.hasIssuedCertificate && !data?.isFieldMentor)
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onInviteAsFieldMentor}>
                    <Text style={styles.btnTxt}>Invite as Field Mentor</Text>
                </TouchableOpacity>
            </LinearGradient>
        );

    // 100% ready to mark complete
    if (data?.progress === 100 && !data?.hasCompleted)
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onMarkComplete}>
                    <Text style={styles.btnTxt}>Mark as Complete</Text>
                </TouchableOpacity>
            </LinearGradient>
        );

    return null;
}

import { TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { Mentee } from "@/types/user.types";

interface ActionProps {
    onIssueCertificate?: () => void;
    onInviteAsFieldMentor?: () => void;
    data?: Mentee;
}

export default function MenteeActions({
    onIssueCertificate,
    onInviteAsFieldMentor,
    data,
}: ActionProps) {
    if (onIssueCertificate && data?.hasCompleted && !data?.hasIssuedCertificate) {
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onIssueCertificate}>
                    <Text style={styles.btnTxt}>Issue Certificate</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    if (
        onInviteAsFieldMentor &&
        data?.hasCompleted &&
        data?.hasIssuedCertificate &&
        !data?.isFieldMentor &&
        !data?.fieldMentorInvitation
    ) {
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onInviteAsFieldMentor}>
                    <Text style={styles.btnTxt}>Invite as Field Mentor</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return null;
}

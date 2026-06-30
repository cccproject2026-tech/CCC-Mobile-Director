import { TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./styles";
import { Mentee } from "@/types/user.types";

interface ActionProps {
    onMarkComplete?: () => void;
    onInviteAsFieldMentor?: () => void;
    onInvitationSent?: () => void;
    data?: Mentee;
}

/** Action buttons for dashboard → Field Mentor Invitations list only. */
export default function FieldMentorInvitationActions({
    onMarkComplete,
    onInviteAsFieldMentor,
    onInvitationSent,
    data,
}: ActionProps) {
    if (data?.hasIssuedCertificate) {
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onInvitationSent}>
                    <Text style={styles.btnTxt}>Invitation Sent</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    if (data?.hasCompleted && !data?.hasIssuedCertificate) {
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onInviteAsFieldMentor}>
                    <Text style={styles.btnTxt}>Invite as Field Mentor</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    if (!data?.hasCompleted) {
        return (
            <LinearGradient colors={["#7C3AED", "#38BDF8"]} style={styles.btnWrap}>
                <TouchableOpacity style={styles.actionBtn} onPress={onMarkComplete}>
                    <Text style={styles.btnTxt}>Mark as Complete</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    return null;
}

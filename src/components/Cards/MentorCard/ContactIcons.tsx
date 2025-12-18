import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    small?: boolean;
};

export default function ContactIcons({ onCall, onChat, onMail, onWhatsApp, small }: Props) {
    const size = small ? 18 : 22;
    const btnSize = small ? 28 : 36;

    return (
        <View style={styles.row}>
            {onCall && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }]} onPress={onCall}>
                    <Ionicons name="call-outline" size={size} color="#fff" />
                </TouchableOpacity>
            )}
            {onChat && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }]} onPress={onChat}>
                    <Ionicons name="chatbubble-outline" size={size} color="#fff" />
                </TouchableOpacity>
            )}
            {onMail && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }]} onPress={onMail}>
                    <Ionicons name="mail-outline" size={size} color="#fff" />
                </TouchableOpacity>
            )}
            {onWhatsApp && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }]} onPress={onWhatsApp}>
                    <Ionicons name="logo-whatsapp" size={size} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row" },
    btn: { alignItems: "center", justifyContent: "center", marginRight: 8 }
});
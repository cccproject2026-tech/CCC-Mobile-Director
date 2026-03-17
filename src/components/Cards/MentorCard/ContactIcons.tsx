import { View, TouchableOpacity, StyleSheet, TouchableOpacityProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    small?: boolean;
    btnStyles?: {}
};

export default function ContactIcons({ onCall, onChat, onMail, onWhatsApp, small, btnStyles }: Props) {
    const size = small ? 15 : 22;
    const btnSize = small ? 22 : 36;

    return (
        <View style={styles.row}>
            {onCall && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }, btnStyles]} onPress={onCall}>
                    <Ionicons name="call-outline" size={size} color="#fff" />
                </TouchableOpacity>
            )}
            {onChat && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }, btnStyles]} onPress={onChat}>
                    <Ionicons name="chatbubble-outline" size={size} color="#fff" />
                </TouchableOpacity>
            )}
            {onMail && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }, btnStyles]} onPress={onMail}>
                    <Ionicons name="mail-outline" size={size} color="#fff" />
                </TouchableOpacity>
            )}
            {onWhatsApp && (
                <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }, btnStyles, {marginRight: 0}]} onPress={onWhatsApp}>
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
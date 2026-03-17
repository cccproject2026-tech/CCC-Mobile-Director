import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

interface Props {
    small?: boolean;
    onCall?: () => void; onMail?: () => void; onChat?: () => void; onWhatsApp?: () => void;
    btnStyles?: {},
    rowStyles?: {}
}

export default function ContactActions({ small, onCall, onMail, onChat, onWhatsApp, btnStyles, rowStyles }: Props) {
    const size = small ? 15 : 22;

    return (
        <View style={[styles.contactRow, rowStyles]}>
            {onCall && <TouchableOpacity style={[styles.iconBtn, btnStyles]} onPress={onCall}><Ionicons name="call-outline" size={size} color="#fff" /></TouchableOpacity>}
            {onChat && <TouchableOpacity style={[styles.iconBtn, btnStyles]} onPress={onChat}><Ionicons name="chatbubble-outline" size={size} color="#fff" /></TouchableOpacity>}
            {onMail && <TouchableOpacity style={[styles.iconBtn, btnStyles]} onPress={onMail}><Ionicons name="mail-outline" size={size} color="#fff" /></TouchableOpacity>}
            {onWhatsApp && <TouchableOpacity style={[styles.iconBtn, btnStyles]} onPress={onWhatsApp}><Ionicons name="logo-whatsapp" size={size} color="#fff" /></TouchableOpacity>}
        </View>
    );
}

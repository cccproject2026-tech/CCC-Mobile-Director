import { Ionicons } from "@expo/vector-icons";
import { View, Image } from "react-native";

export default function ProfileImage({ uri, size }: { uri?: string; size: number }) {
    return (
        <View style={{ width: size, height: size, borderRadius: 8, overflow: "hidden", marginRight: 12 }}>
            {uri ? (
                <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
            ) : (
                <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center" }}>
                    <Ionicons name="person-outline" size={size * 0.45} color="#fff" />
                </View>
            )}
        </View>
    );
}

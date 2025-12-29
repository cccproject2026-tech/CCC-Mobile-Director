import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ProfileItem {
    id: string;
    name: string;
    image?: string;
}

interface ProfileSwiperProps {
    profiles: ProfileItem[];
    onProfilePress?: (profile: ProfileItem) => void;
    showDivider?: boolean;
}

export default function ProfileSwiper({
    profiles,
    onProfilePress,
    showDivider = true,
}: ProfileSwiperProps) {
    const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

    const handleImageError = (profileId: string) => {
        setImageErrors(prev => ({ ...prev, [profileId]: true }));
    };

    const handlePress = (profile: ProfileItem) => {
        if (onProfilePress) {
            onProfilePress(profile);
        }
    };

    if (!profiles || profiles.length === 0) {
        return null;
    }

    return (
        <View style={{ backgroundColor: "transparent" }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {profiles.map((profile) => (
                    <TouchableOpacity
                        key={profile.id}
                        style={styles.profileItem}
                        onPress={() => handlePress(profile)}
                        activeOpacity={onProfilePress ? 0.7 : 1}
                    >
                        <LinearGradient
                            colors={["#7C3AED", "#38BDF8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.avatarContainer}>
                                {profile.image && !imageErrors[profile.id] ? (
                                    <Image
                                        source={{ uri: profile.image }}
                                        style={styles.avatarImg}
                                        onError={() => handleImageError(profile.id)}
                                    />
                                ) : (
                                    <View style={styles.iconPlaceholder}>
                                        <Ionicons name="person-outline" size={28} color="#fff" />
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                        <Text style={styles.profileName} numberOfLines={1}>
                            {profile.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            {showDivider && <View style={styles.divider} />}
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    profileItem: {
        alignItems: "center",
        marginRight: 16,
    },
    gradientBorder: {
        width: 66,
        height: 66,
        borderRadius: 33,
        padding: 3,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: "#1E3A6F", // Match your app's background color
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    iconPlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    profileName: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
        maxWidth: 80,
    },
    divider: {
        marginTop: 8,
        marginHorizontal: 16,
        borderBottomColor: "rgba(255,255,255,0.2)",
        borderBottomWidth: 1,
    },
});

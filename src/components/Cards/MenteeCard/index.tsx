import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProfileImage from "./ProfileImage";
import ContactActions from "./ContactActions";
import MenteeProgress from "./MenteeProgress";
import MenteeActions from "./MenteeActions";
import { Mentee } from "@/types/user.types";
import { styles } from "./styles";
import { router } from "expo-router";

export interface MenteeCardProps {
    data: Mentee;
    layout?: "list" | "card" | "full";
    isSelected?: boolean;
    onToggleSelect?: () => void;
    onPress?: () => void;

    // contact
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;

    // actions
    onMenuPress?: () => void;
    onIssueCertificate?: () => void;
    onInviteAsFieldMentor?: () => void;
    disabled?: boolean;
    disabledMessage?: string;
    showMenu?: boolean;
    paramsData?: any;
}

export default function MenteeCard(props: MenteeCardProps) {
    const {
        data,
        layout = "full",
        isSelected,
        onToggleSelect,
        onPress,
        disabled,
        showMenu,
        onMenuPress,
        paramsData,
    } = props;
    const isSelectionMode = onToggleSelect !== undefined;

    const handleCardPress = () => {
        if (paramsData === "mentees") {
            router.push({
                pathname: "/(director)/(tabs)/roadmaps",
                params: { id: data?.id ?? "" },
            });
            return;
        }
        onPress?.();
    };

    const cardMenuButton =
        onMenuPress && showMenu ? (
            <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={1}
                hitSlop={16}
                onPress={onMenuPress}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
            >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
        ) : null;

    // ▫ LIST MODE
    if (layout === "list") {
        return (
            <View
                style={[
                    styles.listContainer,
                    isSelected && styles.selectedCard,
                    disabled && { opacity: 0.5 },
                ]}
            >
                <Pressable
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 }}
                    onPress={disabled ? undefined : isSelectionMode ? onToggleSelect : handleCardPress}
                >
                    <ProfileImage size={42} uri={data.profilePicture} />
                    <Text numberOfLines={1} style={styles.listName}>
                        {data.username || `${data.firstName} ${data.lastName ?? ""}`}
                    </Text>
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ContactActions small {...props} />
                    {onMenuPress && showMenu ? (
                        <TouchableOpacity
                            activeOpacity={1}
                            hitSlop={16}
                            onPress={onMenuPress}
                            accessibilityLabel="Open menu"
                        >
                            <Ionicons size={18} color="#fff" name="ellipsis-vertical" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    }

    // ▫ CARD MODE (SELECTION)
    if (layout === "card" && isSelectionMode) {
        return (
            <TouchableOpacity
                activeOpacity={disabled ? 1 : 0.8}
                style={[styles.selectionCard, isSelected && styles.selectedCard]}
                onPress={disabled ? undefined : onToggleSelect}
            >
                {!disabled && (
                    <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                    </View>
                )}

                <View style={styles.topSection}>
                    <ProfileImage uri={data.profilePicture} size={90} />

                    <View style={styles.contentSection}>
                        <Text style={styles.name} numberOfLines={1}>
                            {data.username || `${data.firstName} ${data.lastName ?? ""}`}
                        </Text>

                        <Text style={styles.description} numberOfLines={3}>
                            {data.profileInfo ?? "No description"}
                        </Text>
                    </View>
                </View>

                <ContactActions
                    {...props}
                    small
                    rowStyles={{ gap: 2 }}
                    btnStyles={{ marginTop: 7, marginBottom: 10 }}
                />
            </TouchableOpacity>
        );
    }

    // ▫ FULL CARD (DEFAULT)
    const showChevronOnly =
        paramsData === "mentees" || paramsData === "Field-Mentor-Home";

    return (
        <View style={styles.container} pointerEvents="box-none">
            <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
                <View style={styles.topSection}>
                    <View>
                        <ProfileImage uri={data.profilePicture} size={95} />
                        <ContactActions
                            {...props}
                            small
                            rowStyles={{ gap: 2 }}
                            btnStyles={{ marginTop: 7, marginBottom: 10 }}
                        />
                    </View>

                    <View style={[styles.contentSection, cardMenuButton && styles.contentSectionWithMenu]}>
                        <Text style={styles.name} numberOfLines={1}>
                            {data.firstName} {data.lastName} {data.role && `(${data.role})`}
                        </Text>
                        <Text style={styles.description} numberOfLines={3}>
                            {data.profileInfo ?? "No description"}
                        </Text>
                    </View>
                </View>

                <MenteeProgress data={data} />
                <MenteeActions {...props} />
            </TouchableOpacity>

            {showChevronOnly ? (
                <Pressable
                    onPress={() => {
                        if (paramsData === "Field-Mentor-Home") {
                            onPress?.();
                            return;
                        }
                        router.push({
                            pathname: "/(director)/(tabs)/roadmaps",
                            params: { id: data?.id ?? "" },
                        });
                    }}
                    style={
                        paramsData === "Field-Mentor-Home"
                            ? styles.chevronButtonMid
                            : styles.chevronButton
                    }
                    hitSlop={12}
                >
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                </Pressable>
            ) : cardMenuButton ? (
                cardMenuButton
            ) : (
                <View style={styles.chevronButton}>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                </View>
            )}
        </View>
    );
}

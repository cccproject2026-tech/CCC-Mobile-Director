import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ProfileImage from "./ProfileImage";
import ContactActions from "./ContactActions";
import MenteeProgress from "./MenteeProgress";
import MenteeActions from "./MenteeActions";
import { Mentee } from "@/types/user.types";
import { styles } from "./styles";

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
    onMarkComplete?: () => void;
    onIssueCertificate?: () => void;
    onInviteAsFieldMentor?: () => void;
    disabled?: boolean;
    disabledMessage?: string;
    showMenu?: boolean
}

export default function MenteeCard(props: MenteeCardProps) {
    const { data, layout = "full", isSelected, onToggleSelect, onPress, disabled, disabledMessage, showMenu } = props;
    const isSelectionMode = onToggleSelect !== undefined;

    // ▫ LIST MODE
    if (layout === "list")
        return (
            <Pressable
                style={[styles.listContainer, isSelected && styles.selectedCard, disabled && { opacity: 0.5 }]}
                onPress={disabled ? undefined : (isSelectionMode ? onToggleSelect : onPress)}
            >
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ProfileImage size={42} uri={data.profilePicture} />
                    <Text numberOfLines={1} style={styles.listName}>
                        {data.username || `${data.firstName} ${data.lastName ?? ""}`}
                    </Text>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ContactActions small {...props} />
                    {props.onMenuPress && (
                        <TouchableOpacity onPress={(e) => (e.stopPropagation(), props.onMenuPress?.())}>
                            <Ionicons size={18} color="#fff" name="ellipsis-vertical" style={{marginLeft: 4}} />
                        </TouchableOpacity>
                    )}
                </View>

                
            </Pressable>
        );

    // ▫ CARD MODE (SELECTION)
    if (layout === "card" && isSelectionMode)
        return (
            <TouchableOpacity
                activeOpacity={disabled ? 1 : 0.8}
                style={[
                    styles.selectionCard,
                    isSelected && styles.selectedCard,
                ]}
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

                <ContactActions {...props} small rowStyles={{gap: 2}} btnStyles={{marginTop: 7, marginBottom: 10}}/>
            </TouchableOpacity>
        );

    // ▫ FULL CARD (DEFAULT)
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            {/* Menu or Chevron */}
            {props.onMenuPress && showMenu ? (
                <TouchableOpacity style={styles.menuButton} onPress={(e) => (e.stopPropagation(), props.onMenuPress?.())}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
            ) : (
                <View style={{ position: "absolute", top: 14, right: 14 }}>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                </View>
            )}

            <View style={styles.topSection}>
                <View>
                    <ProfileImage uri={data.profilePicture} size={95} />
                    <ContactActions {...props} small rowStyles={{gap: 2}} btnStyles={{marginTop: 7, marginBottom: 10}}/>
                </View>

                <View style={styles.contentSection}>
                    <Text style={styles.name} numberOfLines={1}>
                        {data.firstName} {data.lastName} {data.role && `(${data.role})`}
                    </Text>
                    <Text style={styles.description} numberOfLines={3}>
                        {data.profileInfo ?? "No description"}
                    </Text>
                </View>
            </View>

            {/* Contact Row */}

            {/* Progress / Phase / Status */}
            <MenteeProgress data={data} />

            {/* Action Buttons (Mark Complete / Issue / Invite) */}
            <MenteeActions {...props} />
        </TouchableOpacity>
    );
}

import React from "react";
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ContactIcons from "./ContactIcons";
import ContextMenu, { MenuItem } from "@/components/Menu/ContextMenu";

export interface MentorCardData {
    id: string;
    name: string;
    role: string;
    menteesCount?: number;
    description?: string;
    profilePicture?: string;
}

interface MentorCardProps {
    mentor: MentorCardData;
    layout?: "card" | "list";
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    menuItems?: MenuItem[];
    onPress?: () => void;
    onMenu?: () => void;
}

export default function MentorCard({
    mentor,
    layout = "card",
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    menuItems,
    onPress,
    onMenu
}: MentorCardProps) {

    /* LIST LAYOUT ------------------------------*/
    if (layout === "list") {
        return (
            <Pressable style={styles.listContainer} onPress={onPress}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <ImageContainer src={mentor.profilePicture} size={46} />

                    <View style={styles.listInfo}>
                        <Text style={styles.listName} numberOfLines={1}>{mentor.name}</Text>

                        {mentor.menteesCount ? (
                            <View style={styles.menteesBadge}>
                                <View style={styles.dot} />
                                <Text style={styles.menteesText}>{mentor.menteesCount} Mentees</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <ContactIcons small onCall={onCall} onChat={onChat} onMail={onMail} onWhatsApp={onWhatsApp} btnStyles={{marginRight: 3}}/>
                <ContextMenu menuItems={menuItems} fallbackPress={onMenu} />
            </Pressable>
        );
    }

    /* CARD LAYOUT ------------------------------*/
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <View style={styles.cardRow}>
                <View>
                    <ImageContainer src={mentor.profilePicture} size={100} />
                    <ContactIcons onCall={onCall} onChat={onChat} onMail={onMail} onWhatsApp={onWhatsApp} small btnStyles={{marginRight: 5, marginTop:4}}/>
                </View>

                <View style={styles.cardInfo}>
                    <View style={[styles.row, styles.justifyBetween]}>
                        <View style={styles.row}>
                            <Text style={styles.name} numberOfLines={1}>{mentor.name}</Text>
                            {mentor.menteesCount ? (
                                <View style={styles.menteesBadge}>
                                    <View style={styles.dot} />
                                    <Text style={styles.menteesText}>{mentor.menteesCount} Mentees</Text>
                                </View>
                            ) : null}
                        </View>
                        <ContextMenu menuItems={menuItems} fallbackPress={onMenu} />
                    </View>

                    <Text style={styles.role}>-{mentor.role}</Text>
                    <Text style={styles.desc} numberOfLines={2}>
                        {mentor.description ?? "No description available"}
                    </Text>
                </View>
            </View>

        </TouchableOpacity>
    );
}


/* Sub Component: Profile Image + Placeholder */
const ImageContainer = ({ src, size }: { src?: string; size: number }) => (
    <View style={[styles.avatar, { width: size, height: size }]}>
        {src ? (
            <Image source={{ uri: src }} style={styles.img} />
        ) : (
            <View style={styles.placeholder}>
                <Ionicons name="person-outline" size={size * 0.45} color="#fff" />
            </View>
        )}
    </View>
);


export const styles = StyleSheet.create({
    /* Card */
    card: {
        backgroundColor: "rgba(33, 58, 115, 1)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        padding: 12,
        marginBottom: 12,
    },
    cardRow: { flexDirection: "row" },
    cardInfo: { flex: 1 },

    name: { fontSize: 16, fontWeight: "600", color: "#fff", marginRight: 16 },
    role: { fontSize: 14, color: "#fff", marginBottom: 6 },
    desc: { fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 20,marginTop:10 },

    /* Avatar */
    avatar: { borderRadius: 10, overflow: "hidden", marginRight: 12 },
    img: { width: "100%", height: "100%" },
    placeholder: { flex: 1, backgroundColor: "#2A5080", alignItems: "center", justifyContent: "center" },

    /* List Layout */
    listContainer: {
        flexDirection: "row", 
        alignItems: "center",
        backgroundColor: "rgba(24,68,123,1)",
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: "rgba(255,255,255,0.3)",
        padding: 10, 
        marginBottom: 8,
        justifyContent: 'space-between'
    },
    listInfo: {  flexDirection: 'row' },
    listName: { fontSize: 14, fontWeight: "600", color: "#fff", marginRight: 5 },

    /* Mentees Badge */
    menteesBadge: { flexDirection: "row", alignItems: "center" },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFC107", marginRight: 6 },
    menteesText: { fontSize: 11, color: "#FFC107", fontWeight: "500" },
    row: { flexDirection: "row", alignItems: 'center' },
    justifyBetween: {justifyContent: 'space-between'},

});
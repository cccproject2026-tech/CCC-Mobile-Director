import { isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { roadmapTheme } from '@/components/ui/design-system';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import AddUserSection from '@/components/Home/AddUserSection';
type Props = {
    title: string;
    desciption: string;
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    data: any
    modelOpen?: any
};

const NewHomeScreenCard: React.FC<Props> = ({
    title,
    desciption,
    iconName,
    data,
    modelOpen
}) => {
    const { user } = useAuthStore();
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const userId = (user as { id?: string; _id?: string })?.id ?? (user as { _id?: string })?._id;
    const userName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Personal Notes';
    console.log("title", title);
    return (
        <View
            style={[
                styles.container as ViewStyle,
            ]}
        >
            <View style={styles.headerContainer}>
                <View style={styles.headerSubContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconName} size={18} color={roadmapTheme.textPrimary} />
                    </View>
                    <Text style={styles.titleText}>{title}</Text>
                </View>
                <View style={styles.viewAllContainer}>
                    <Text style={styles.viewAllText}>
                        View all
                    </Text>

                    <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#EAF7FF"
                    />
                </View>
            </View>
            <Text style={styles.descriptionText}>{desciption}</Text>


            {title !== "Directors Notes" && title !== "New User" ? <View style={styles.itemMainContainer}>

                {data.map((item: any) => (

                    <TouchableOpacity onPress={() => {
                        item?.title === "Create New Roadmap" ? modelOpen() :
                        router.push({
                            pathname: item.route as any,
                            params: item.params,
                        })
                    }}
                        key={item.id}
                        style={[styles.itemSubContainer, { width: data.length < 4 ? "31%" : "23%" }]}
                    >
                        <Ionicons name={item.iconName} size={20} color="white" style={{ marginRight: 6 }} />
                        <Text style={styles.itemName}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>


                ))}
            </View> :
                <View style={styles.addUserContainer}>

                    {title === "Directors Notes" ? (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: '/(director)/(tabs)/profile/personal-notes/new-note',
                                    params: { userName, userId },
                                })
                            }
                            style={styles.textInputContanier}
                        >
                            <Text style={styles.addNoteText}>
                                Add a New Note
                            </Text>

                            <Ionicons
                                name="add-circle-outline"
                                size={22}
                                color="black"
                                style={{ backgroundColor: "#E0E7EE", borderRadius: 20 }}
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setShowAddUserForm(!showAddUserForm)}
                            style={[styles.textInputContanier, { marginBottom: showAddUserForm ? 10 : 0 }]}
                        >
                            <Text style={styles.addNoteText}>
                                {showAddUserForm ? "Close User Form" : "Add New User"}
                            </Text>

                            <Ionicons
                                name={showAddUserForm ? "close-outline" : "add-circle-outline"}
                                size={22}
                                color="black"
                                style={{ backgroundColor: "#E0E7EE", borderRadius: 20 }}
                            />
                        </TouchableOpacity>
                    )}

                </View>
            }

            {title === 'New User' && showAddUserForm && (
                <AddUserSection onUserCreated={() => setShowAddUserForm(false)} />
            )}
        </View>
    );
};

export default NewHomeScreenCard;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // marginBottom: 4
    },
    headerSubContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6
    },
    titleText: {
        color: roadmapTheme.textPrimary,
        fontWeight: "800",
        fontSize: isSmallDevice ? 14 : 16,
        letterSpacing: -0.2,
    },
    descriptionText: {
        color: roadmapTheme.textMuted,
        fontSize: isSmallDevice ? 10 : 12,
        lineHeight: 16,
        marginTop: 4,
    },
    itemMainContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginTop: 12,
    },
    itemSubContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderColor: 'rgba(255,255,255,0.12)',
        padding: isSmallDevice ? 7 : 8,
        minHeight: 90,
        borderWidth: 1,
        borderRadius: 12,
        width: "23%",
        marginRight: "2%",
        marginBottom: 8
    },
    itemName: {
        fontSize: isSmallDevice ? 10 : 11,
        fontWeight: "600",
        color: "white",
        textAlign: "center",
        width: "100%",
    },
    textInputContanier: {
        width: "50%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        paddingHorizontal: isSmallDevice ? 8 : 10,
        paddingVertical: isSmallDevice ? 7 : 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#E0E7EE",
        marginTop: 12,
        marginBottom: 6
    },
    addNoteText: {
        fontWeight: "500",
    },
    viewAllText: {
        fontSize: isSmallDevice ? 12 : 12,
        fontWeight: "400",
        color: "rgba(255,255,255,0.75)",
    },

    viewAllContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        marginTop: -10
    },
    addUserContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    }

});

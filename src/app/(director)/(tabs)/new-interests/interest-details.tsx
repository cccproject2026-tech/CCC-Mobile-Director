
import TopBar from '@/components/Header/TopBar';
import AppModal from '@/components/Modals/AppModal';
import {
    CommonCard,
    GradientBackground,
    homeLayout,
    roadmapTheme,
} from '@/components/ui/design-system';
import { useInterests, useUpdateInterestStatus } from '@/hooks/useInterest';
import { InterestItem } from '@/types/interest.types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* -------------------------------------------------------
   Extract & Normalize Form Data from InterestItem
-------------------------------------------------------- */
const extractFormData = (interest: InterestItem) => {
    return {
        // Personal
        firstName: interest.firstName ?? '',
        lastName: interest.lastName ?? '',
        phoneNumber: interest.phoneNumber ?? '',
        email: interest.email ?? '',
        title: interest.title ?? '',
        yearsInMinistry: interest.yearsInMinistry ?? '',
        conference: interest.conference ?? '',

        // Dynamic church list
        churchList: (interest.churchDetails ?? []).map(c => ({
            churchName: c.churchName ?? '',
            churchPhone: c.churchPhone ?? '',
            churchWebsite: c.churchWebsite ?? '',
            churchAddress: c.churchAddress ?? '',
            city: c.city ?? '',
            state: c.state ?? '',
            zipCode: c.zipCode ?? '',
            country: c.country ?? '',
        })),

        // Misc
        serviceProjects: interest.currentCommunityProjects ?? '',
        interests: interest.interests?.join('\n\n') ?? '',
        comments: interest.comments ?? '',
    };
};

export default function InterestFormScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { interestId } = useLocalSearchParams<{ interestId: string }>();
console.log("Interest ID:--------", interestId);
    const { data: interestsData, isLoading } = useInterests();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInterestStatus();

    /* -------------------------------------------------------
       Find interest by normalized id
    -------------------------------------------------------- */
    const interest = useMemo(() => {
        return interestsData?.find(i => i.id === interestId);
    }, [interestsData, interestId]);

    console.log("Interest ID:", interestId, "Found Interest status:", interest?.status);
    const formData = useMemo(() => (interest ? extractFormData(interest) : null), [interest]);

    const userName = interest
        ? `${interest.firstName ?? ''} ${interest.lastName ?? ''}`.trim() || 'Unknown'
        : 'Unknown';

    const userRole = interest?.title || 'N/A';

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRejectedConfirmation, setShowRejectedConfirmation] = useState(false);

    /* -------------------------------------------------------
       ACTIONS
    -------------------------------------------------------- */
    const handleAccept = () => {
        if (!interest?.id) return Alert.alert("Error", "Interest ID not found");
        console.log("Accepting interest ID:", interest);
        updateStatus(
            { interestId: interest.user?._id as string, status: "accepted" },
            {
                onSuccess: (e) => {
                    console.log("Success:", e);
                    Alert.alert("Success", "Request accepted", [
                        {
                            text: "OK",
                            onPress: () =>
                                router.push({
                                    pathname:
                                        '/(director)/(tabs)/new-interests/assign-scholorship',
                                    params: {
                                        menteeId: String(interest.user?._id ?? ''),
                                        applicantRole: interest.user?.role ?? '',
                                    },
                                }),
                        },
                    ]);
                },
                onError: (error) => {
                    console.log("Error:", error);
                    Alert.alert("Error", error.message || "Failed to accept the request");
                },
            }
        );
    };


    const handleAddToPending = () => {
        if (!interest?.id) return Alert.alert("Error", "Interest ID not found");
        updateStatus(
            { interestId: interest.user?._id as string, status: 'pending' },
            {
                onSuccess: () => {
                    Alert.alert("Success", "Request moved to pending", [
                        { text: "OK", onPress: () => router.back() }
                    ]);
                },
                onError: (error) => {
                    Alert.alert("Error", error.message || "Failed to update the request");
                }
            }
        );
    };

    const handleConfirmReject = () => {
        if (!interest?.id) return Alert.alert("Error", "Interest ID not found");

        updateStatus(
            { interestId: interest.user?._id as string, status: 'rejected' },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setShowRejectedConfirmation(true);
                },
                onError: (error) => {
                    Alert.alert("Error", error.message || "Failed to reject request");
                }
            }
        );
    };


    if (!formData) {
        return (
            <GradientBackground style={styles.centeredState}>
                <Text style={styles.stateText}>Unable to load form data.</Text>
                <Pressable onPress={() => router.back()} style={styles.stateButton}>
                    <Text style={styles.stateButtonText}>Go Back</Text>
                </Pressable>
            </GradientBackground>
        );
    }

    /* -------------------------------------------------------
       RENDER
    -------------------------------------------------------- */
    return (
        <GradientBackground style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TopBar showBackButton showUserName showDrawer={false} showNotifications={false} customTitle='Interest Form' />
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingBottom: bottom + 20,
                        flexGrow: 1,
                        paddingHorizontal: homeLayout.screenPaddingH,
                        gap: homeLayout.sectionGap,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {isLoading ? (
                        <View style={styles.loadingBlock}>
                            <ActivityIndicator color={roadmapTheme.textPrimary} size="large" />
                            <Text style={styles.loadingText}>Loading interest details...</Text>
                        </View>
                    ) : !interest ? (
                        <View style={styles.loadingBlock}>
                            <Text style={styles.stateText}>Interest not found</Text>
                            <Pressable onPress={() => router.back()} style={styles.stateButton}>
                                <Text style={styles.stateButtonText}>Go Back</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            <CommonCard compact style={styles.userCard}>
                                <View style={styles.userCardTop}>
                                    <View style={styles.avatarContainer}>
                                        <Ionicons name="person-outline" size={28} color="#fff" />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userName}>{userName}</Text>
                                        <Text style={styles.userRole}>{userRole}</Text>
                                    </View>
                                </View>

                                {/* CONTACT ICONS */}
                                <View style={styles.contactIcons}>
                                    {/* CALL */}
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => console.log("Call:", interest.phoneNumber)}
                                    >
                                        <Ionicons name="call-outline" size={22} color="#fff" />
                                    </TouchableOpacity>

                                    {/* CHAT */}
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => console.log("Chat:", interest.email)}
                                    >
                                        <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                                    </TouchableOpacity>

                                    {/* EMAIL */}
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => console.log("Email:", interest.email)}
                                    >
                                        <Ionicons name="mail-outline" size={22} color="#fff" />
                                    </TouchableOpacity>

                                    {/* WHATSAPP */}
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => console.log("WhatsApp:", interest.phoneNumber)}
                                    >
                                        <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </CommonCard>

                            <CommonCard compact>
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Personal Information</Text>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>First Name</Text>
                                                <Text style={styles.fieldValue}>{formData.firstName}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Last Name</Text>
                                                <Text style={styles.fieldValue}>{formData.lastName}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Phone Number</Text>
                                                <Text style={styles.fieldValue}>{formData.phoneNumber}</Text>
                                            </View>

                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Email</Text>
                                                <Text style={styles.fieldValue}>{formData.email}</Text>
                                            </View>
                                        </View>
                                    </View>
                            </CommonCard>

                                {formData.churchList.map((church, index) => (
                                    <CommonCard compact key={index}>
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>
                                                Current Church - {index + 1} Information
                                            </Text>

                                            {/* CHURCH NAME */}
                                            <View style={[styles.input, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Church Name</Text>
                                                <Text style={styles.fieldValue}>{church.churchName || 'N/A'}</Text>
                                            </View>

                                            {/* PHONE / WEBSITE */}
                                            <View style={styles.row}>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Church Phone</Text>
                                                    <Text style={styles.fieldValue}>{church.churchPhone}</Text>
                                                </View>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Church Website</Text>
                                                    <Text style={styles.fieldValue}>{church.churchWebsite}</Text>
                                                </View>
                                            </View>

                                            {/* ADDRESS */}
                                            <View style={[styles.input, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Church Address</Text>
                                                <Text style={styles.fieldValue}>{church.churchAddress}</Text>
                                            </View>

                                            {/* CITY / STATE */}
                                            <View style={styles.row}>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>City</Text>
                                                    <Text style={styles.fieldValue}>{church.city}</Text>
                                                </View>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>State</Text>
                                                    <Text style={styles.fieldValue}>{church.state}</Text>
                                                </View>
                                            </View>

                                            {/* ZIP / COUNTRY */}
                                            <View style={styles.row}>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Zip Code</Text>
                                                    <Text style={styles.fieldValue}>{church.zipCode}</Text>
                                                </View>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Country</Text>
                                                    <Text style={styles.fieldValue}>{church.country}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </CommonCard>
                                ))}

                            <CommonCard compact>
                                    <Text style={styles.sectionTitle}>Other Information</Text>

                                    <View style={[styles.input, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Title</Text>
                                        <Text style={styles.fieldValue}>{formData.title}</Text>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Years in Ministry</Text>
                                            <Text style={styles.fieldValue}>{formData.yearsInMinistry}</Text>
                                        </View>
                                        <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Conference</Text>
                                            <Text style={styles.fieldValue}>{formData.conference}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.input, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Current Community Service Projects</Text>
                                        <Text style={styles.fieldValue}>{formData.serviceProjects}</Text>
                                    </View>

                                    <View style={[styles.input, styles.textArea, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Interests</Text>
                                        <Text style={styles.fieldValue}>{formData.interests}</Text>
                                    </View>

                                    <View style={[styles.input, styles.textArea, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Comments</Text>
                                        <Text style={styles.fieldValue}>{formData.comments}</Text>
                                    </View>
                            </CommonCard>

                            <View style={styles.actionButtons}>
                                <Pressable
                                    style={[styles.rejectButton, isUpdatingStatus && styles.buttonDisabled]}
                                    onPress={() => setShowRejectModal(true)}
                                    disabled={isUpdatingStatus}
                                >
                                    <Text style={styles.rejectButtonText}>REJECT</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.acceptOutlineButton, isUpdatingStatus && styles.buttonDisabled]}
                                    onPress={handleAccept}
                                    disabled={isUpdatingStatus}
                                >
                                    {isUpdatingStatus ? (
                                        <ActivityIndicator color={roadmapTheme.textPrimary} size="small" />
                                    ) : (
                                        <Text style={styles.acceptOutlineText}>ACCEPT</Text>
                                    )}
                                </Pressable>
                            </View>

                            <Pressable
                                style={styles.pendingButton}
                                onPress={handleAddToPending}
                            >
                                <Ionicons name="arrow-back" size={18} color={roadmapTheme.textPrimary} />
                                <Text style={styles.pendingButtonText}>Add to Pending</Text>
                            </Pressable>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* MODALS */}
            <AppModal
                visible={showRejectModal}
                type="confirm"
                title="Are you sure want to Reject Interest?"
                confirmText="Reject"
                cancelText="Cancel"
                onCancel={() => setShowRejectModal(false)}
                onConfirm={handleConfirmReject}
            />



            <AppModal
                visible={showRejectedConfirmation}
                type="success"
                title="Interest Rejected"
                onClose={() => {
                    setShowRejectedConfirmation(false);
                    router.back();
                }}
            />
        </GradientBackground>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    stateText: {
        color: roadmapTheme.textPrimary,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
    },
    stateButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    stateButtonText: {
        color: roadmapTheme.textPrimary,
        fontWeight: '700',
    },
    loadingBlock: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: roadmapTheme.textMuted,
        marginTop: 12,
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        paddingBottom: Platform.OS === 'android' ? 12 : 16,
        position: 'relative',
    },
    userCard: {
        marginTop: 4,
    },
    userCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 12 : 16,
    },
    avatarContainer: {
        width: Platform.OS === 'android' ? 48 : 52,
        height: Platform.OS === 'android' ? 48 : 52,
        backgroundColor: 'rgba(111, 212, 190, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.28)',
        borderRadius: Platform.OS === 'android' ? 24 : 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Platform.OS === 'android' ? 10 : 12,
    },
    userName: {
        fontSize: Platform.OS === 'android' ? 16 : 17,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    userRole: {
        fontSize: Platform.OS === 'android' ? 13 : 14,
        color: roadmapTheme.textMuted,
    },
    contactIcons: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 12 : 16,
    },
    iconButton: {
        width: Platform.OS === 'android' ? 36 : 40,
        height: Platform.OS === 'android' ? 36 : 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        gap: 2,
    },
    sectionTitle: {
        fontSize: Platform.OS === 'android' ? 14 : 15,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        marginBottom: Platform.OS === 'android' ? 8 : 10,
        letterSpacing: -0.15,
    },
    row: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 8 : 12,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 10,
        paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
        paddingVertical: Platform.OS === 'android' ? 8 : 10,
        fontSize: Platform.OS === 'android' ? 14 : 15,
        color: roadmapTheme.textPrimary,
        marginBottom: Platform.OS === 'android' ? 8 : 10,
    },
    halfInput: {
        flex: 1,
    },
    textArea: {
        minHeight: Platform.OS === 'android' ? 80 : 100,
        paddingTop: Platform.OS === 'android' ? 8 : 10,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    rejectButton: {
        flex: 1,
        minHeight: 48,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rejectButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textActive,
    },
    acceptOutlineButton: {
        flex: 1,
        minHeight: 48,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptOutlineText: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    pendingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        gap: 8,
        marginBottom: 8,
    },
    pendingButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: roadmapTheme.textPrimary,
    },
    readOnlyField: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: roadmapTheme.frostedBorder,
    },
    fieldLabel: {
        fontSize: Platform.OS === 'android' ? 11 : 12,
        color: roadmapTheme.textSubtle,
        marginBottom: Platform.OS === 'android' ? 2 : 4,
    },
    fieldValue: {
        fontSize: Platform.OS === 'android' ? 13 : 14,
        color: roadmapTheme.textPrimary,
        fontWeight: '500',
        lineHeight: Platform.OS === 'android' ? 16 : 18,
    },
});

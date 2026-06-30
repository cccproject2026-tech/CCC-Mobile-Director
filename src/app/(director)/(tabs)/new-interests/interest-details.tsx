
import TopBar from '@/components/Header/TopBar';
import AcceptInterestModal from '@/components/Modals/AcceptInterestModal';
import AppModal from '@/components/Modals/AppModal';
import {
    CommonCard,
    GradientBackground,
    homeLayout,
    roadmapTheme,
} from '@/components/ui/design-system';
import { Colors } from '@/constants/Colors';
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
import { dialPhone, getInterestContact, openSMS, openWhatsApp, sendEmail } from '@/utils/contactActions';

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
    const { interestId: interestIdParam } = useLocalSearchParams<{ interestId: string }>();
    const interestId = Array.isArray(interestIdParam) ? interestIdParam[0] : interestIdParam;
    const { data: interestsData, isPending } = useInterests();
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInterestStatus();

    /* -------------------------------------------------------
       Find interest by normalized id
    -------------------------------------------------------- */
    const interest = useMemo(() => {
        return interestsData?.find(i => i.id === interestId);
    }, [interestsData, interestId]);

    const formData = useMemo(() => (interest ? extractFormData(interest) : null), [interest]);

    const userName = interest
        ? `${interest.firstName ?? ''} ${interest.lastName ?? ''}`.trim() || 'Unknown'
        : 'Unknown';

    const userRole = interest?.title || 'N/A';

    const { phone: contactPhone, email: contactEmail } = useMemo(
        () => (interest ? getInterestContact(interest) : { phone: undefined, email: undefined }),
        [interest]
    );

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRejectedConfirmation, setShowRejectedConfirmation] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);

    const menteeId = String(interest?.user?._id ?? '');
    const isPastorApplicant = (interest?.user?.role ?? '').toLowerCase() === 'pastor';

    /* -------------------------------------------------------
       ACTIONS
    -------------------------------------------------------- */
    const confirmAccept = () => {
        if (!interest?.id) return Alert.alert('Error', 'Interest ID not found');

        updateStatus(
            { interestId: interest.user?._id as string, status: 'accepted' },
            {
                onSuccess: () => {
                    if (isPastorApplicant) {
                        setShowAcceptModal(true);
                        return;
                    }
                    router.back();
                },
                onError: (error) => {
                    Alert.alert('Error', error.message || 'Failed to accept the request');
                },
            },
        );
    };

    const handleAccept = () => {
        if (!interest?.id) return Alert.alert('Error', 'Interest ID not found');

        Alert.alert(
            'Accept Interest',
            `Are you sure you want to accept ${userName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Accept', onPress: confirmAccept },
            ],
        );
    };

    const handleAcceptLater = () => {
        setShowAcceptModal(false);
        router.push('/(director)/(tabs)/new-interests');
    };

    const handleAcceptFollowUpAssign = () => {
        setShowAcceptModal(false);
        router.push({
            pathname: '/(director)/(tabs)/mentees/assign-mentors' as any,
            params: { id: menteeId },
        });
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
            <View style={styles.screenRoot}>
            <GradientBackground style={styles.centeredState}>
                {isPending ? (
                    <ActivityIndicator color={roadmapTheme.textPrimary} size="large" />
                ) : (
                    <>
                        <Text style={styles.stateText}>Unable to load form data.</Text>
                        <Pressable onPress={() => router.back()} style={styles.stateButton}>
                            <Text style={styles.stateButtonText}>Go Back</Text>
                        </Pressable>
                    </>
                )}
            </GradientBackground>
            </View>
        );
    }

    /* -------------------------------------------------------
       RENDER
    -------------------------------------------------------- */
    return (
        <View style={styles.screenRoot}>
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
                    {!interest ? (
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
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => dialPhone(contactPhone)}
                                    >
                                        <Ionicons name="call-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openSMS(contactPhone)}
                                    >
                                        <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => sendEmail(contactEmail)}
                                    >
                                        <Ionicons name="mail-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => openWhatsApp(contactPhone)}
                                    >
                                        <Ionicons name="logo-whatsapp" size={20} color="#fff" />
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

            <AcceptInterestModal
                visible={showAcceptModal}
                onLater={handleAcceptLater}
                onAssign={handleAcceptFollowUpAssign}
                assignButtonText={
                    isPastorApplicant ? 'Assign Mentor >>' : 'Assign Mentees >>'
                }
            />
        </GradientBackground>
        </View>
    );
}


const styles = StyleSheet.create({
    screenRoot: {
        flex: 1,
        backgroundColor: Colors.appBgGradient[0],
    },
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
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingBottom: 14,
        position: 'relative',
    },
    userCard: {
        marginTop: 4,
    },
    userCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(111, 212, 190, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.28)',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userName: {
        fontSize: 17,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    userRole: {
        fontSize: 13,
        color: roadmapTheme.textMuted,
    },
    contactIcons: {
        flexDirection: 'row',
        gap: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: roadmapTheme.frostedSurface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    section: {
        gap: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        marginBottom: 10,
        letterSpacing: -0.15,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: roadmapTheme.textPrimary,
        marginBottom: 10,
    },
    halfInput: {
        flex: 1,
    },
    textArea: {
        minHeight: 90,
        paddingTop: 10,
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
        borderRadius: homeLayout.cardRadiusCompact,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    rejectButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textActive,
        letterSpacing: 0.3,
    },
    acceptOutlineButton: {
        flex: 1,
        minHeight: 48,
        paddingVertical: 12,
        backgroundColor: roadmapTheme.frostedSurface,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        borderRadius: homeLayout.cardRadiusCompact,
        alignItems: 'center',
        justifyContent: 'center',
    },
    acceptOutlineText: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        letterSpacing: 0.3,
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
        fontSize: 11,
        color: roadmapTheme.textSubtle,
        marginBottom: 3,
    },
    fieldValue: {
        fontSize: 13,
        color: roadmapTheme.textPrimary,
        fontWeight: '500',
        lineHeight: 18,
    },
});

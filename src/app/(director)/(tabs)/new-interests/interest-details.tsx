
import TopBar from '@/components/Header/TopBar';
import AppModal from '@/components/Modals/AppModal';
import { useInterests, useUpdateInterestStatus } from '@/hooks/useInterest';
import { InterestItem } from '@/types/interest.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

const LOGO = require('@/assets/images/app/CCClogo.png');

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

        updateStatus(
            { interestId: interest.user?._id as string, status: "accepted" },
            {
                onSuccess: () => {
                    Alert.alert("Success", "Request accepted", [
                        {
                            text: "OK",
                            onPress: () =>
                                router.push(
                                    `/(director)/(tabs)/new-interests/assign-scholorship?menteeId=${interest.user?._id}`
                                ),
                        },
                    ]);
                },
                onError: (error) => {
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
            <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
                    Unable to load form data.
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        marginTop: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 8,
                    }}
                >
                    <Text style={{ color: '#fff' }}>Go Back</Text>
                </Pressable>
            </View>
        );
    }

    /* -------------------------------------------------------
       RENDER
    -------------------------------------------------------- */
    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TopBar showUserName showDrawer={false} showNotifications={false} customTitle='Interest Form' />
                </View>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: bottom + 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* HEADER */}

                    {/* LOADING */}
                    {isLoading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator color="#fff" size="large" />
                            <Text style={{ color: '#fff', marginTop: 12 }}>Loading interest details...</Text>
                        </View>
                    ) : !interest ? (
                        /* NOT FOUND */
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
                                Interest not found
                            </Text>
                            <Pressable
                                onPress={() => router.back()}
                                style={{
                                    marginTop: 16,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: '#fff' }}>Go Back</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            {/* USER CARD */}
                            <View style={styles.userCard}>
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
                            </View>

                            {/* ======================
                                PERSONAL INFORMATION
                               ====================== */}
                            <View style={styles.sectionWrapper}>
                                <View style={styles.sectionBorder}>
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
                                </View>

                                {/* ======================
                                    CHURCHES (DYNAMIC)
                                   ====================== */}
                                {formData.churchList.map((church, index) => (
                                    <View key={index} style={styles.sectionBorder}>
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
                                    </View>
                                ))}

                                {/* ======================
                                    OTHER INFORMATION
                                   ====================== */}
                                <View style={styles.section}>
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
                                </View>
                            </View>

                            {/* ======================
                               ACTION BUTTONS
                            ====================== */}
                            <View style={styles.actionButtons}>
                                <Pressable
                                    style={[styles.rejectButton, isUpdatingStatus && styles.buttonDisabled]}
                                    onPress={() => setShowRejectModal(true)}
                                    disabled={isUpdatingStatus}
                                >
                                    <Text style={styles.buttonText}>REJECT</Text>
                                </Pressable>

                                <Pressable
                                    style={[styles.nextButton, isUpdatingStatus && styles.buttonDisabled]}
                                    onPress={handleAccept}
                                    disabled={isUpdatingStatus}
                                >
                                    {isUpdatingStatus ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={[styles.buttonText, { color: '#fff' }]}>ACCEPT</Text>
                                    )}
                                </Pressable>
                            </View>

                            <View style={styles.pendingButtonContainer}>
                                <Pressable
                                    style={styles.pendingButton}
                                    onPress={handleAddToPending}
                                >
                                    <Ionicons name="arrow-back" size={20} color="#fff" />
                                    <Text style={styles.pendingButtonText}>Add to Pending</Text>
                                </Pressable>
                            </View>
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
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2563A8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        paddingBottom: Platform.OS === 'android' ? 12 : 16,
        position: 'relative',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionWrapper: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 20,
        marginHorizontal: 16,
        paddingVertical: 16,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    titleContainer: {
        backgroundColor: '#176192',
        borderRadius: Platform.OS === 'android' ? 8 : 11,
        paddingVertical: Platform.OS === 'android' ? 6 : 9,
        paddingHorizontal: Platform.OS === 'android' ? 20 : 28,
    },
    titleText: {
        color: '#E2E8F0',
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '600',
    },
    logoButton: {
        width: Platform.OS === 'android' ? 32 : 36,
        height: Platform.OS === 'android' ? 32 : 36,
        borderRadius: Platform.OS === 'android' ? 16 : 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.65)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: Platform.OS === 'android' ? 24 : 27,
        height: Platform.OS === 'android' ? 24 : 27,
        borderRadius: Platform.OS === 'android' ? 12 : 15,
    },
    userCard: {
        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 16 : 24,
        padding: Platform.OS === 'android' ? 12 : 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
    },
    userCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 12 : 16,
    },
    avatarContainer: {
        width: Platform.OS === 'android' ? 48 : 56,
        height: Platform.OS === 'android' ? 48 : 56,
        backgroundColor: '#14517D',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 24 : 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Platform.OS === 'android' ? 10 : 12,
    },
    userName: {
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    userRole: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        color: 'rgba(255,255,255,0.8)',
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
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 8 : 12,
    },
    sectionTitle: {
        fontSize: Platform.OS === 'android' ? 14 : 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: Platform.OS === 'android' ? 8 : 10,
    },
    row: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 8 : 12,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
        paddingVertical: Platform.OS === 'android' ? 8 : 10,
        fontSize: Platform.OS === 'android' ? 14 : 15,
        color: '#fff',
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
        gap: Platform.OS === 'android' ? 12 : 16,
        marginVertical: Platform.OS === 'android' ? 16 : 24,
        width: Platform.OS === 'android' ? '60%' : '50%',
        alignSelf: 'center',
    },
    rejectButton: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 14,
        backgroundColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        alignItems: 'center',
    },
    nextButton: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: '600',
        color: '#1a5b77',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    pendingButtonContainer: {
        marginHorizontal: 16,
        marginBottom: Platform.OS === 'android' ? 16 : 24,
        alignItems: 'flex-start',
    },
    pendingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        paddingVertical: Platform.OS === 'android' ? 8 : 12,
        paddingHorizontal: Platform.OS === 'android' ? 16 : 20,
        borderRadius: Platform.OS === 'android' ? 8 : 10,
    },
    pendingButtonText: {
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '500',
        color: '#fff',
        marginLeft: Platform.OS === 'android' ? 8 : 12,
    },


    sectionBorder: {
        borderBottomColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomStartRadius: 50,
        borderBottomEndRadius: 50,
        marginBottom: Platform.OS === 'android' ? 12 : 20,
    },
    readOnlyField: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    fieldLabel: {
        fontSize: Platform.OS === 'android' ? 11 : 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: Platform.OS === 'android' ? 2 : 4,
    },
    fieldValue: {
        fontSize: Platform.OS === 'android' ? 13 : 14,
        color: '#fff',
        fontWeight: '500',
        lineHeight: Platform.OS === 'android' ? 16 : 18,
    },
});

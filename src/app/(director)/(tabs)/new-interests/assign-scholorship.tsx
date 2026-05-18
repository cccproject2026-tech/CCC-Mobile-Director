import AcceptInterestModal from '@/components/Modals/AcceptInterestModal';
import AppModal from '@/components/Modals/AppModal';
import EditAmountBottomSheet from '@/components/Sheets/EditAmountBottomSheet';
import { useGetUserById } from '@/hooks/useProfile';
import { useScholarships, useAddAwardedUser, useUpdateScholarship } from '@/hooks/useScholorships';
import { Scholarship } from '@/types/scholorship.types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
    CommonCard,
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from '@/components/ui/design-system';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScholarshipTypeKey = 'full' | 'partial' | 'fullCost' | 'half' | 'adra';

const SCHOLARSHIP_TYPE_MAP: Record<ScholarshipTypeKey, string> = {
    full: 'Full scholarship',
    partial: 'Partial scholarship',
    fullCost: 'Full Cost',
    half: 'Half scholarship',
    adra: 'ADRA Discount',
};

export default function AssignScholarshipScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams<{ menteeId?: string | string[]; applicantRole?: string | string[] }>();
    const menteeIdRaw = params.menteeId;
    const menteeId = (
        Array.isArray(menteeIdRaw) ? menteeIdRaw[0] : menteeIdRaw
    )?.trim() ?? '';
    const applicantRoleRaw = params.applicantRole;
    const applicantRoleParam = (
        Array.isArray(applicantRoleRaw) ? applicantRoleRaw[0] : applicantRoleRaw
    )?.trim();
    const { data: mentee } = useGetUserById(menteeId);
    const { top, bottom } = useSafeAreaInsets();
    const [isRural, setIsRural] = useState(true);
    const [editAmount, setEditAmount] = useState('');
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [selectedScholarshipKey, setSelectedScholarshipKey] =
        useState<ScholarshipTypeKey>('full');
    const [isProductExpanded, setIsProductExpanded] = useState(true);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const { data: scholarships = [], isLoading } = useScholarships();
    const addAwardedUser = useAddAwardedUser();
    const updateScholarship = useUpdateScholarship();

    const selectedScholarship: Scholarship | undefined = useMemo(() => {
        const typeLabel = SCHOLARSHIP_TYPE_MAP[selectedScholarshipKey].toLowerCase();
        return scholarships.find((s) => s.type.toLowerCase() === typeLabel);
    }, [scholarships, selectedScholarshipKey]);

    const resolvedApplicantRole = (mentee?.role ?? applicantRoleParam ?? '').trim();
    const isPastorApplicant = resolvedApplicantRole.toLowerCase() === 'pastor';

    const effectiveAmount = selectedScholarship?.amount ?? 0;

    const scholarshipOptions: { id: ScholarshipTypeKey; label: string }[] = [
        { id: 'full', label: 'Full Scholarship' },
        { id: 'partial', label: 'Partial Scholarship' },
        { id: 'fullCost', label: 'Full Cost' },
        { id: 'half', label: 'Half Scholarship' },
        { id: 'adra', label: 'ADRA Discount' },
    ];

    const handleOpenEdit = () => {
        setEditAmount(String(effectiveAmount));
        bottomSheetModalRef.current?.present();
    };

    const handleCloseEdit = () => {
        bottomSheetModalRef.current?.dismiss();
    };

    const handleSaveEditAmount = () => {
        if (!selectedScholarship || !editAmount) {
            handleCloseEdit();
            return;
        }

        const newAmount = parseFloat(editAmount);
        if (!isNaN(newAmount)) {
            updateScholarship.mutate({
                scholarshipId: selectedScholarship.id,
                payload: { amount: newAmount },
            });
        }

        handleCloseEdit();
    };

    const handleAccept = () => {
        console.log('handleAccept clicked', { menteeId, selectedScholarship });

        if (!menteeId || !selectedScholarship) {
            console.log('Blocking accept because of missing data');
            return;
        }

        const payload = {
            userId: menteeId,
            awardedDate: new Date().toISOString(),
            academicYear: new Date().getFullYear().toString(),
            awardStatus: 'active' as const,
        };

        console.log('Awarding scholarship with payload:', payload);

        addAwardedUser.mutate(
            {
                scholarshipId: selectedScholarship.id,
                payload,
            },
            {
                onSuccess: () => {
                    if(isPastorApplicant) {
                        setShowAcceptModal(true);
                    } else {
                        // @ts-ignore
                        navigation.pop(2);
                    }
                },
                onError: (error) => {
                    setErrorMsg(error?.message);
                    setShowErrorModal(true);
                    console.log('Award failed', error);
                },
            }
        );
    };

    const handleAcceptLater = () => {
        setShowAcceptModal(false);
        router.push('/(director)/(tabs)/new-interests');
    };

    const handleAcceptFollowUpAssign = () => {
        setShowAcceptModal(false);
        if (isPastorApplicant) {
            router.push({
                pathname: '/(director)/(tabs)/mentees/assign-mentors' as any,
                params: { id: menteeId },
            });
            return;
        }
        // router.push({
        //     pathname: '/(director)/(tabs)/mentors/assign-mentees' as any,
        //     params: { id: menteeId },
        // });
    };

    console.log('Current Selection:', {
        key: selectedScholarshipKey,
        hasData: scholarships.length > 0,
        found: !!selectedScholarship
    });

    return (
        <>
            <AppModal
                visible={showErrorModal}
                type="success"
                title={errorMsg}
                autoClose={3000}
                onClose={() => {
                    setShowErrorModal(false);
                    setErrorMsg('')
                }}
            />
            <AppModal
                visible={showErrorModal}
                type="success"
                title={errorMsg}
                autoClose={3000}
                onClose={() => {
                    setShowErrorModal(false);
                    setErrorMsg('')
                }}
            />
            <GradientBackground style={[styles.container, { paddingTop: top + 10 }]}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingBottom: bottom + 20,
                        paddingHorizontal: homeLayout.screenPaddingH,
                        gap: homeLayout.sectionGap,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenBackHeader
                        title="Interest Received"
                        onBack={() => router.back()}
                        style={styles.screenHeader}
                    />

                    <CommonCard compact>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <Ionicons name="person-outline" size={28} color="#fff" />
                            </View>
                            <View>
                                <Text style={styles.userName}>
                                    {mentee?.firstName + ' ' + mentee?.lastName || 'Unknown User'}
                                </Text>
                                <Text style={styles.userRole}>
                                    {mentee?.role || 'Pastor'}
                                </Text>
                            </View>
                        </View>

                        {/* Contact Icons */}
                        <View style={styles.contactIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="call-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="mail-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </CommonCard>

                    <CommonCard compact style={styles.toggleCard}>
                        <Text style={styles.toggleLabel}>Choose Rural or Urban :</Text>
                        <View style={styles.toggleOptions}>
                            <Text style={styles.toggleText}>Rural</Text>
                            <Switch
                                value={!isRural}
                                onValueChange={() => setIsRural((prev) => !prev)}
                                trackColor={{
                                    false: 'rgba(255,255,255,0.3)',
                                    true: 'rgba(255,255,255,0.3)',
                                }}
                                thumbColor="#fff"
                            />
                            <Text style={styles.toggleText}>Urban</Text>
                        </View>
                    </CommonCard>

                    <CommonCard compact style={styles.productCard}>
                        <Pressable
                            style={styles.productHeader}
                            onPress={() => setIsProductExpanded(!isProductExpanded)}
                        >
                            <Text style={styles.productTitle}>Product and Services</Text>
                            <Ionicons
                                name={isProductExpanded ? 'chevron-up' : 'chevron-down'}
                                size={24}
                                color="#fff"
                            />
                        </Pressable>

                        {isProductExpanded && (
                            <View style={styles.scholarshipList}>
                                {scholarshipOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={styles.scholarshipItem}
                                        onPress={() => setSelectedScholarshipKey(option.id)}
                                        disabled={isLoading}
                                    >
                                        <View style={styles.radioOuter}>
                                            {selectedScholarshipKey === option.id && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <Text style={styles.scholarshipLabel}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </CommonCard>

                    {/* Amount Section */}
                    <View style={styles.amountSection}>
                        <View style={styles.amountCard}>
                            <View style={styles.amountTextContainer}>
                                <Text style={styles.amountLabel}>
                                    Amount under{'\n'}
                                    {SCHOLARSHIP_TYPE_MAP[selectedScholarshipKey]}:
                                </Text>
                                <Text style={styles.amountValue}>${effectiveAmount}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.editButton} onPress={handleOpenEdit}>
                            <Ionicons name="create-outline" size={18} color="#fff" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Text style={styles.backButtonText}>BACK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAccept}
                            disabled={addAwardedUser.isPending || !selectedScholarship}
                        >
                            <Text style={styles.acceptButtonText}>
                                {addAwardedUser.isPending ? 'AWARDING...' : 'ACCEPT'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <AcceptInterestModal
                    visible={showAcceptModal}
                    onLater={handleAcceptLater}
                    onAssign={handleAcceptFollowUpAssign}
                    assignButtonText={
                        isPastorApplicant ? 'Assign Mentor >>' : 'Assign Mentees >>'
                    }
                />

                <EditAmountBottomSheet
                    ref={bottomSheetModalRef}
                    title={SCHOLARSHIP_TYPE_MAP[selectedScholarshipKey]}
                    amount={editAmount}
                    onChangeAmount={setEditAmount}
                    onCancel={handleCloseEdit}
                    onSave={handleSaveEditAmount}
                />
            </GradientBackground>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screenHeader: {
        marginHorizontal: -homeLayout.screenPaddingH,
        marginBottom: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.28)',
        backgroundColor: 'rgba(111, 212, 190, 0.14)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    userName: {
        fontSize: 17,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    userRole: {
        fontSize: 14,
        color: roadmapTheme.textMuted,
    },
    contactIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
    },
    toggleOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: roadmapTheme.textMuted,
    },
    productCard: {
        overflow: 'hidden',
        padding: 0,
        gap: 0,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: roadmapTheme.divider,
    },
    productTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
        letterSpacing: -0.15,
    },
    scholarshipList: {
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 14,
        gap: 4,
    },
    scholarshipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: roadmapTheme.frostedBorderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: roadmapTheme.accentMint,
    },
    scholarshipLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: roadmapTheme.textPrimary,
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    amountCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    amountTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amountLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: roadmapTheme.textMuted,
        lineHeight: 16,
        flex: 1,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: '800',
        color: roadmapTheme.accentGold,
        marginLeft: 12,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 10,
        minWidth: 70,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    backButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textActive,
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 48,
        justifyContent: 'center',
    },
    acceptButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: roadmapTheme.textPrimary,
    },
});

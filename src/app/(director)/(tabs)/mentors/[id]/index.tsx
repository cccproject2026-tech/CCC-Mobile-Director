import TopBar from '@/components/Header/TopBar';
import ConfirmModal from '@/components/Modals/ConfirmModal';
import SuccessModal from '@/components/Modals/SuccessModal';
import { ChurchInfoSection, OtherInfoSection, PersonalInfoSection, ProfileInfoSection } from '@/components/ProfileSection';
import ProfileContent from '@/components/ProfileSection/ProfileContent';
import { icons } from '@/constants';
import { Colors } from '@/constants/Colors';
import { useMentorMenteeProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/useProfile';
import { ChurchInfo, UpdateProfileData, UserRole } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const PROGRESS_ENABLED_ROLES: UserRole[] = ["Pastor", "Seminarian", "lay leader"];

export default function MentorMenteeProfileScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: profileData, isLoading, isError } = useMentorMenteeProfile(id);
    const updateProfile = useUpdateProfile(profileData?.user?.email || "", profileData?.user?.id || "");
    const uploadProfilePicture = useUploadProfilePicture();

    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState<UpdateProfileData>({
        firstName: '', lastName: '', phoneNumber: '', churches: [],
        title: '', yearsInMinistry: '', conference: '',
        currentCommunityServiceProjects: '', interests: [],
        comments: '', bio: '',
    });

    const handleEditPress = useCallback(() => {
        if (profileData?.user && profileData?.interest) {
            // 1. Manually trigger the sync right now
            setFormData({
                firstName: profileData.user.firstName || '',
                lastName: profileData.user.lastName || '',
                phoneNumber: profileData.interest.phoneNumber || '',
                churches: profileData.interest.churchDetails || [],
                title: profileData.interest.title || '',
                yearsInMinistry: profileData.interest.yearsInMinistry || '',
                conference: profileData.interest.conference || '',
                currentCommunityServiceProjects: profileData.interest.currentCommunityProjects || '',
                interests: profileData.interest.interests || [],
                comments: profileData.interest.comments || '',
                bio: profileData.interest.profileInfo || '',
            });
            setProfileImage(profileData.user.profilePicture || null);

            // 2. Then enter edit mode
            setIsEditing(true);
        } else {
            Alert.alert("Error", "Profile data is not fully loaded yet.");
        }
    }, [profileData]);

    // useEffect(() => {
    //     if (isEditing && !isInitialized) {
    //         syncFormWithData();
    //         setIsInitialized(true); // Mark as initialized so it doesn't loop
    //     }

    //     // Reset the flag when the user stops editing
    //     if (!isEditing) {
    //         setIsInitialized(false);
    //     }
    // }, [isEditing, isInitialized, syncFormWithData]);

    const shouldShowProgress = useMemo(() => {
        return PROGRESS_ENABLED_ROLES.includes(profileData?.user?.role as UserRole);
    }, [profileData?.user?.role]);

    const progressPercentage = useMemo(() => profileData?.progress?.overallProgress || 0, [profileData]);

    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    // ============= HANDLERS =============

    const updateField = useCallback((field: keyof UpdateProfileData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateChurch = useCallback((index: number, field: keyof ChurchInfo, value: string) => {
        setFormData((prev) => {
            const churches = [...(prev.churches || [])];
            churches[index] = { ...churches[index], [field]: value };
            return { ...prev, churches };
        });
    }, []);

    const pickImage = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Access to photos is needed.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setProfileImage(asset.uri); // Local preview
            setSelectedImageFile({
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                fileName: asset.fileName || `profile-${Date.now()}.jpg`,
            });
        }
    }, []);

    const handleConfirmSave = useCallback(async () => {
        setShowConfirmModal(false);
        try {
            if (selectedImageFile) {
                await uploadProfilePicture.mutateAsync(selectedImageFile);
            }

            const updateData: UpdateProfileData = {
                ...formData,
                churches: (formData.churches || []).map(({ id, ...rest }: any) => rest as ChurchInfo),
            };

            await updateProfile.mutateAsync(updateData);
            setIsEditing(false);
            setTimeout(() => setShowSuccessModal(true), 100);
        } catch (error: any) {
            Alert.alert('Update Failed', error?.message || 'Failed to update profile.');
        }
    }, [formData, selectedImageFile, updateProfile, uploadProfilePicture]);

    // ============= RENDER HELPERS =============

    const renderAvatar = () => {
        // Source selection logic
        const imageSource = profileImage
            ? { uri: profileImage }
            : (profileData?.user?.profilePicture ? { uri: profileData.user.profilePicture } : icons.myProfile);

        return (
            <View style={styles.avatarContainer}>
                <Image source={imageSource} style={styles.avatarImage} />
                {isEditing && (
                    <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage}>
                        <Image source={icons.editIcon} style={styles.editIcon} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderProgressBar = () => {
        if (!shouldShowProgress) return null;
        return (
            <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Progress</Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                </View>
                <Text style={styles.progressText}>{progressPercentage}%</Text>
            </View>
        );
    };

    if (isLoading) return <View style={[styles.container, styles.center]}><Text>Loading...</Text></View>;

    return (
        <ProfileContent
            userId={id}
            isOwnProfile={false}
            bottomInsets={bottom}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    center: { justifyContent: 'center', alignItems: 'center' },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },

    // Header
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    headerTitle: {
        marginLeft: 8,
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },

    // Profile Header
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
        borderBottomColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomStartRadius: 50,
        borderBottomEndRadius: 50,
        paddingBottom: 10,
    },
    editProfileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 5,
        backgroundColor: '#233A6F82',
        borderWidth: 1,
        borderColor: '#233A6F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },

    // Progress Bar
    progressContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginTop: 8,
        marginHorizontal: 72,
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    progressBarContainer: {
        flex: 1,
        backgroundColor: '#182c5b',
        height: 8,
        borderRadius: 4,
    },
    progressBar: {
        backgroundColor: '#fff',
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },

    // Action Buttons
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#14517D',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },

    // Sections

    mainContentBox: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },

    // Edit Actions
    editActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        marginBottom: 24,
        maxWidth: '50%',
        alignSelf: 'center',
    },
    actionButton2: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    cancelButtonText: {
        color: '#1a5b77',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Icons
    editIcon: {
        width: 18,
        height: 18,
    },
    smallIcon: {
        width: 20,
        height: 20,
    },
});

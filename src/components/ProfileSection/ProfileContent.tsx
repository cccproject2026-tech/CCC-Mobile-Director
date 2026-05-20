import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import TopBar from '@/components/Header/TopBar';
import ConfirmModal from '@/components/Modals/ConfirmModal';
import SuccessModal from '@/components/Modals/SuccessModal';
import { ChurchInfoSection, OtherInfoSection, PersonalInfoSection, ProfileInfoSection } from '@/components/ProfileSection';
import { icons } from '@/constants';
import { useDeleteUser, useMentorMenteeProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/useProfile';
import { ChurchInfo, UpdateProfileData, UserRole, UserWithInterest } from '@/types/user.types';
import { Colors } from '@/constants/Colors';
import { roadmapTheme, homeLayout } from '@/components/ui/design-system';

const PROGRESS_ENABLED_ROLES: UserRole[] = ["Pastor", "Seminarian", "lay leader"];

interface ProfileContentProps {
    userId: string;
    isOwnProfile: boolean;
    bottomInsets: number;
    profileData?: any;
    isLoading: boolean;
    isError: boolean;
}

export default function ProfileContent({ userId, isOwnProfile, bottomInsets, profileData,
    isLoading,
    isError }: ProfileContentProps) {
    const router = useRouter();

    const updateProfile = useUpdateProfile(
        profileData?.user?.email || "",
        profileData?.user?.id || ""
    );
    const uploadProfilePicture = useUploadProfilePicture();
    const deleteProfile = useDeleteUser();

    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

    const [formData, setFormData] = useState<UpdateProfileData>({
        firstName: '', lastName: '', phoneNumber: '', churches: [],
        title: '', yearsInMinistry: '', conference: '',
        currentCommunityServiceProjects: '', interests: [],
        comments: '', bio: '',
    });

    const role = profileData?.user?.role as UserRole;
    const isDirector = role === 'director';
    const isSaving = uploadProfilePicture.isPending || updateProfile.isPending || deleteProfile.isPending;

    const shouldShowProgress = useMemo(() => {
        return PROGRESS_ENABLED_ROLES.includes(role);
    }, [role]);

    const progressPercentage = useMemo(() => profileData?.progress?.overallProgress || 0, [profileData]);

    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const handleEditPress = useCallback(() => {
        if (profileData?.user) {
            const interest = profileData.interest;
            setFormData({
                firstName: profileData.user.firstName || '',
                lastName: profileData.user.lastName || '',
                phoneNumber: interest?.phoneNumber || '',
                churches: interest?.churchDetails || [],
                title: interest?.title || '',
                yearsInMinistry: interest?.yearsInMinistry || '',
                conference: interest?.conference || '',
                currentCommunityServiceProjects: interest?.currentCommunityProjects || '',
                interests: interest?.interests || [],
                comments: interest?.comments || '',
                bio: interest?.profileInfo || '',
            });
            setProfileImage(profileData.user.profilePicture || null);
            setIsEditing(true);
        } else {
            Alert.alert("Error", "Profile data is not fully loaded yet.");
        }
    }, [profileData]);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setSelectedImageFile(null);
        setProfileImage(profileData?.user?.profilePicture || null);
    }, [profileData]);

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
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setProfileImage(asset.uri);
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
            if (selectedImageFile) await uploadProfilePicture.mutateAsync(selectedImageFile);
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

    const handleDeleteProfile = useCallback(async () => {
        try {
            await deleteProfile.mutateAsync(userId);
            router.back();
            // setShowDeleteSuccessModal(true);
        } catch (error: any) {
            Alert.alert('Delete Failed', error?.message || 'Failed to delete profile.');
        } finally {
            setShowDeleteConfirmModal(false);
        }
    }, [userId, deleteProfile]);

    const renderAvatar = () => (
        <View style={styles.avatarContainer}>
            <Image
                source={profileImage ? { uri: profileImage } : (profileData?.user?.profilePicture ? { uri: profileData.user.profilePicture } : icons.myProfile)}
                style={styles.avatarImage}
            />
            {isEditing && (
                <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage} disabled={isSaving}>
                    <Image source={icons.editIcon} style={styles.editIcon} />
                </TouchableOpacity>
            )}
        </View>
    );

    if (isError) return <View style={styles.center}><Text style={styles.errorText}>Error loading profile.</Text></View>;

    return (
        <LinearGradient colors={[...Colors.appBgGradient]} style={styles.container}>
            {isLoading ? <View style={styles.center}><ActivityIndicator size="large" color="#fff" /><Text style={styles.loadingText}>Loading...</Text></View> : (
                <View style={{ flex: 1 }} pointerEvents={isSaving ? 'none' : 'auto'}>
                    <TopBar showUserName={isOwnProfile} />

                    <TouchableOpacity
                        onPress={() => (isEditing ? handleCancel() : router.back())}
                        style={styles.headerContainer}
                        disabled={isSaving}
                    >
                        <Ionicons name="chevron-back" size={28} color={isSaving ? 'rgba(255,255,255,0.5)' : '#fff'} />
                        <Text style={[styles.headerTitle, isSaving && { color: 'rgba(255,255,255,0.5)' }]}>
                            {isEditing ? 'Edit Profile' : 'My Profile'}
                        </Text>
                    </TouchableOpacity>

                    <KeyboardAwareScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInsets + 24 }]}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.profileHeader}>
                            {renderAvatar()}
                            {!isEditing && (
                                <>
                                    <Text style={styles.greeting}>{greeting} {profileData?.user?.firstName}</Text>
                                    <Text style={styles.roleText}>{profileData?.interest?.title || role?.toUpperCase()}</Text>
                                </>
                            )}
                        </View>

                        {!isEditing && shouldShowProgress && (
                            <View style={styles.progressContainer}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <View style={styles.progressBarContainer}>
                                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{progressPercentage}%</Text>
                            </View>
                        )}

                        {!isEditing && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(director)/(tabs)/profile/documents' as any)}>
                                    <Text style={styles.actionButtonText}>Documents</Text>
                                    <Image source={icons.attachmentIcon} style={styles.smallIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
                                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                                    <Image source={icons.editIcon} style={styles.smallIcon} />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.mainContentBox}>
                            <PersonalInfoSection
                                isEditing={isEditing} profileData={profileData} formData={formData}
                                onUpdateField={updateField} onPickImage={pickImage} profileImage={profileImage}
                                onUpdateChurch={updateChurch} onAddChurch={() => { }} onRemoveChurch={() => { }}
                                showTitleDropdown={false} onTitleSelect={() => { }} onToggleTitleDropdown={() => { }}
                            />

                            <ProfileInfoSection
                                isEditing={isEditing} profileData={profileData} formData={formData}
                                onUpdateField={updateField} onPickImage={pickImage} profileImage={profileImage as string}
                                showTitleDropdown={showTitleDropdown} onTitleSelect={(v) => { updateField('title', v); setShowTitleDropdown(false); }}
                                onToggleTitleDropdown={setShowTitleDropdown} onUpdateChurch={updateChurch} onAddChurch={() => { }} onRemoveChurch={() => { }}
                            />

                            {!isDirector && (
                                <>
                                    <ChurchInfoSection
                                        isEditing={isEditing} profileData={profileData} formData={formData}
                                        onUpdateChurch={updateChurch} onAddChurch={() => { }} onRemoveChurch={() => { }}
                                        showTitleDropdown={false} onTitleSelect={() => { }} onToggleTitleDropdown={() => { }}
                                        onPickImage={pickImage} profileImage={profileImage} onUpdateField={updateField}
                                    />
                                    <OtherInfoSection
                                        isEditing={isEditing} profileData={profileData} formData={formData}
                                        showTitleDropdown={showTitleDropdown} onUpdateField={updateField}
                                        onTitleSelect={(v) => { updateField('title', v); setShowTitleDropdown(false); }}
                                        onToggleTitleDropdown={setShowTitleDropdown} onUpdateChurch={updateChurch} onAddChurch={() => { }} onRemoveChurch={() => { }}
                                        onPickImage={pickImage} profileImage={profileImage}
                                    />
                                </>
                            )}

                            {!isEditing && !isOwnProfile && (
                                <View style={styles.deleteButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.deleteProfileButton}
                                        onPress={() => setShowDeleteConfirmModal(true)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#E53935" />
                                        <Text style={styles.deleteProfileText}>Delete Profile</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {isEditing && (
                            <View style={styles.editActions}>
                                <TouchableOpacity style={[styles.actionButtonSecondary, styles.cancelButton]} onPress={handleCancel} disabled={isSaving}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButtonSecondary, styles.saveButton]} onPress={() => setShowConfirmModal(true)} disabled={isSaving}>
                                    <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </KeyboardAwareScrollView>
                </View>
            )}
            {isSaving && (
                <View style={styles.centeredOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingOverlayText}>Saving Changes...</Text>
                </View>
            )}

            <ConfirmModal visible={showConfirmModal} title="Save changes?" onConfirm={handleConfirmSave} onCancel={() => setShowConfirmModal(false)} />
            <SuccessModal visible={showSuccessModal} message="Profile Updated!" onClose={() => setShowSuccessModal(false)} />

            <ConfirmModal
                visible={showDeleteConfirmModal}
                title="Are you sure want to delete Profile ?"
                onConfirm={handleDeleteProfile}
                onCancel={() => setShowDeleteConfirmModal(false)}
                confirmText="Delete"
                confirmButtonStyle={{ backgroundColor: '#E53935' }}
                confirmTextStyle={{ color: '#fff' }}
            />
            <SuccessModal
                visible={showDeleteSuccessModal}
                message="Profile Deleted"
                onClose={() => {
                    setShowDeleteSuccessModal(false);
                    router.back();
                }}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    actionButton2: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
    scrollView: {
        flex: 1,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centeredOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    role: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: roadmapTheme.divider,
    },
    headerTitle: {
        marginLeft: 8,
        fontSize: 20,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
        letterSpacing: -0.2,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: roadmapTheme.divider,
    },
    editProfileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: roadmapTheme.frostedBorderStrong,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: 16,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
        marginBottom: 4,
        letterSpacing: -0.1,
    },
    roleText: {
        fontSize: 13,
        color: roadmapTheme.textMuted,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginHorizontal: 32,
        marginBottom: 16,
        gap: 8,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: roadmapTheme.textMuted,
    },
    progressBarContainer: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        height: 6,
        borderRadius: 3,
    },
    progressBar: {
        backgroundColor: roadmapTheme.accentMint,
        height: 6,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        borderRadius: homeLayout.cardRadiusCompact,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: roadmapTheme.frostedSurface,
    },
    actionButtonText: {
        color: roadmapTheme.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    mainContentBox: {
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 14,
        borderRadius: homeLayout.cardRadius,
        backgroundColor: roadmapTheme.frostedSurface,
        gap: 2,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    actionButtonSecondary: {
        flex: 1,
        minHeight: 48,
        paddingVertical: 12,
        borderRadius: homeLayout.cardRadiusCompact,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255,255,255,0.92)',
    },
    cancelButtonText: {
        color: roadmapTheme.textActive,
        fontSize: 15,
        fontWeight: '800',
    },
    saveButton: {
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
    },
    saveButtonText: {
        color: roadmapTheme.textPrimary,
        fontSize: 15,
        fontWeight: '800',
    },
    editIcon: {
        width: 18,
        height: 18,
    },
    smallIcon: {
        width: 20,
        height: 20,
        tintColor: roadmapTheme.textPrimary,
    },
    loadingText: {
        color: roadmapTheme.textMuted,
        fontSize: 15,
        marginTop: 10,
    },
    loadingOverlayText: {
        color: roadmapTheme.textPrimary,
        marginTop: 12,
        fontWeight: '700',
    },
    errorText: {
        color: roadmapTheme.textPrimary,
        fontSize: 16,
        textAlign: 'center',
    },
    goBackButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: homeLayout.cardRadiusCompact,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    goBackText: {
        color: roadmapTheme.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButtonContainer: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    deleteProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E53935',
    },
    deleteProfileText: {
        color: '#E53935',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },
});
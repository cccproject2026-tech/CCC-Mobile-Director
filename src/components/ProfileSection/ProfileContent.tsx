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
import { useMentorMenteeProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/useProfile';
import { ChurchInfo, UpdateProfileData, UserRole, UserWithInterest } from '@/types/user.types';
import { Colors } from '@/constants/Colors';

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

    const role = profileData?.user?.role as UserRole;
    const isDirector = role === 'director';
    const isSaving = uploadProfilePicture.isPending || updateProfile.isPending;

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
        if (profileData?.user && profileData?.interest) {
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
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
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

                        {!isEditing && !isDirector && (
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/profile/documents' as any)}>
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

                            {!isDirector && (
                                <>
                                    <ProfileInfoSection
                                        isEditing={isEditing} profileData={profileData} formData={formData}
                                        onUpdateField={updateField} onPickImage={pickImage} profileImage={profileImage as string}
                                        showTitleDropdown={showTitleDropdown} onTitleSelect={(v) => { updateField('title', v); setShowTitleDropdown(false); }}
                                        onToggleTitleDropdown={setShowTitleDropdown} onUpdateChurch={updateChurch} onAddChurch={() => { }} onRemoveChurch={() => { }}
                                    />
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
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
        borderBottomColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth,
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
    roleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginHorizontal: 40,
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        marginRight: 8,
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
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 4,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    mainContentBox: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    actionButtonSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#fff',
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
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    editIcon: {
        width: 18,
        height: 18,
    },
    smallIcon: {
        width: 20,
        height: 20,
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 8
    },
    loadingOverlayText: {
        color: '#fff',
        marginTop: 12,
        fontWeight: 'bold'
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    goBackButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: Colors.lightBlue,
        borderRadius: 8,
    },
    goBackText: {
        color: '#fff',
        fontSize: 14,
    },
});
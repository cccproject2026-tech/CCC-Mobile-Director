
import {
  ChurchInfoSection,
  OtherInfoSection,
  PersonalInfoSection,
  ProfileInfoSection,
} from '@/components/ProfileSection';
import TopBar from '@/components/Header/TopBar';
import { icons } from '@/constants';

import { Colors } from '@/constants/Colors';
import { useProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import { ChurchInfo, UpdateProfileData } from '@/types/user.types';
import ConfirmModal from '@/components/Modals/ConfirmModal';
import SuccessModal from '@/components/Modals/SuccessModal';

const CLEAN_CHURCH_TEMPLATE: ChurchInfo = {
  churchName: '',
  churchPhone: '',
  churchAddress: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  churchWebsite: '',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const { data: profileData, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    churches: [],
    title: '',
    yearsInMinistry: '',
    conference: '',
    currentCommunityServiceProjects: '',
    interests: [],
    comments: '',
    bio: '',
  });

  useEffect(() => {
    if (isEditing && !isFormInitialized && profileData?.user) {
      setFormData({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phoneNumber: profileData.interest?.phoneNumber || '',
        churches: profileData.interest?.churchDetails || [],
        title: profileData.interest?.title || '',
        yearsInMinistry: profileData.interest?.yearsInMinistry || '',
        conference: profileData.interest?.conference || '',
        currentCommunityServiceProjects:
          profileData.interest?.currentCommunityProjects || '',
        interests: profileData.interest?.interests || [],
        comments: profileData.interest?.comments || '',
        bio: profileData.interest?.profileInfo || '',
      });
      setProfileImage(profileData.user.profilePicture || null);
      setSelectedImageFile(null);
      setIsFormInitialized(true);
    }

    if (!isEditing && isFormInitialized) {
      setIsFormInitialized(false);
    }
  }, [isEditing, isFormInitialized, profileData?.user?.id]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const updateField = useCallback(
    (field: keyof UpdateProfileData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateChurch = useCallback(
    (index: number, field: keyof ChurchInfo, value: string) => {
      setFormData(prev => {
        const churches = [...(prev.churches || [])];
        const validFields: (keyof ChurchInfo)[] = [
          'churchName',
          'churchPhone',
          'churchAddress',
          'city',
          'state',
          'zipCode',
          'country',
          'churchWebsite',
        ];
        if (validFields.includes(field)) {
          churches[index] = { ...churches[index], [field]: value };
        }
        return { ...prev, churches };
      });
    },
    [],
  );

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload a profile picture.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);

        const fileObj = {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `profile-${Date.now()}.jpg`,
        };
        setSelectedImageFile(fileObj);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const addChurch = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      churches: [
        ...(prev.churches || []),
        {
          ...CLEAN_CHURCH_TEMPLATE,
          id: `temp-${Date.now()}`,
        },
      ],
    }));
  }, []);

  const removeChurch = useCallback(
    (index: number) => {
      if ((formData.churches?.length || 0) > 1) {
        setFormData(prev => ({
          ...prev,
          churches: prev.churches?.filter((_, i) => i !== index),
        }));
      }
    },
    [formData.churches],
  );

  const handleEditPress = useCallback(() => {
    setShowSuccessModal(false);
    setShowConfirmModal(false);
    setIsEditing(true);
  }, []);

  const handleSavePress = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const sanitizeChurches = (churches: ChurchInfo[] | undefined): ChurchInfo[] => {
    if (!churches || churches.length === 0) return [];
    return churches.map(church => ({
      churchName: church.churchName || '',
      churchPhone: church.churchPhone || '',
      churchAddress: church.churchAddress || '',
      city: church.city || '',
      state: church.state || '',
      zipCode: church.zipCode || '',
      country: church.country || '',
      churchWebsite: church.churchWebsite || '',
    }));
  };

  const handleConfirmSave = useCallback(async () => {
    setShowConfirmModal(false);
    try {
      if (selectedImageFile) {
        await uploadProfilePicture.mutateAsync(selectedImageFile);
      }

      const cleanedChurches = sanitizeChurches(formData.churches);

      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        churches: cleanedChurches,
        title: formData.title,
        yearsInMinistry: formData.yearsInMinistry,
        conference: formData.conference,
        currentCommunityServiceProjects:
          formData.currentCommunityServiceProjects,
        interests: formData.interests,
        comments: formData.comments,
        bio: formData.bio,
      };

      await updateProfile.mutateAsync(updateData);

      setIsEditing(false);
      setSelectedImageFile(null);

      setTimeout(() => setShowSuccessModal(true), 100);
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update profile. Please try again.',
      );
    }
  }, [formData, selectedImageFile, updateProfile, uploadProfilePicture]);

  const handleCancelSave = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setIsEditing(false);
    setSelectedImageFile(null);
    setIsFormInitialized(false);

    if (profileData?.user) {
      setFormData({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phoneNumber: profileData.interest?.phoneNumber || '',
        churches: profileData.interest?.churchDetails || [],
        title: profileData.interest?.title || '',
        yearsInMinistry: profileData.interest?.yearsInMinistry || '',
        conference: profileData.interest?.conference || '',
        currentCommunityServiceProjects:
          profileData.interest?.currentCommunityProjects || '',
        interests: profileData.interest?.interests || [],
        comments: profileData.interest?.comments || '',
        bio: profileData.interest?.profileInfo || '',
      });
      setProfileImage(profileData.user.profilePicture || null);
    }
  }, [profileData]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleTitleSelect = useCallback(
    (option: string) => {
      updateField('title', option);
      setShowTitleDropdown(false);
    },
    [updateField],
  );

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : profileData?.user?.profilePicture
              ? { uri: profileData.user.profilePicture }
              : icons.myProfile
        }
        style={styles.avatarImage}
      />
      {isEditing && (
        <TouchableOpacity
          style={styles.editAvatarBadge}
          onPress={pickImage}
        >
          <Image source={icons.editIcon} style={styles.editIcon} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <TouchableOpacity
      onPress={() => (isEditing ? handleCancel() : router.back())}
      style={styles.headerContainer}
    >
      <Ionicons name="chevron-back" size={28} color="#fff" />
      <Text style={styles.headerTitle}>
        {isEditing ? 'Edit Profile' : 'My Profile'}
      </Text>
    </TouchableOpacity>
  );



  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/profile/documents' as any)}
      >
        <Text style={styles.actionButtonText}>Documents</Text>
        <Image source={icons.attachmentIcon} style={styles.smallIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleEditPress}
      >
        <Text style={styles.actionButtonText}>Edit Profile</Text>
        <Image source={icons.editIcon} style={styles.smallIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderEditActions = () => (
    <View style={styles.editActions}>
      <TouchableOpacity
        style={[styles.actionButtonSecondary, styles.cancelButton]}
        onPress={handleCancel}
        disabled={updateProfile.isPending || uploadProfilePicture.isPending}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButtonSecondary, styles.saveButton]}
        onPress={handleSavePress}
        disabled={updateProfile.isPending || uploadProfilePicture.isPending}
      >
        <Text style={styles.saveButtonText}>
          {uploadProfilePicture.isPending || updateProfile.isPending
            ? 'Saving...'
            : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#176192', '#1D548D', '#264387']}
        style={styles.container}
      >
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (isError || !profileData?.user) {
    return (
      <LinearGradient
        colors={['#176192', '#1D548D', '#264387']}
        style={styles.container}
      >
        <View style={styles.centeredPadded}>
          <Text style={styles.errorText}>
            Failed to load profile data. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#176192', '#1D548D', '#264387']}
      style={styles.container}
    >
      <TopBar role="pastor" />
      {renderHeader()}

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {!isEditing && (
          <>
            <View style={styles.profileHeader}>
              {renderAvatar()}
              <Text style={styles.greeting}>
                {greeting} {profileData.user.firstName} {profileData.user.lastName}
              </Text>
              <Text style={styles.roleText}>
                {profileData.interest?.title || 'Pastor'}
              </Text>
            </View>

            {renderActionButtons()}

            <View style={styles.mainContentBox}>
              <ProfileInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileData.user.profilePicture as string}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <PersonalInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileImage}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <ChurchInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onPickImage={pickImage}
                profileImage={profileImage}
                onUpdateField={updateField}
              />

              <OtherInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                profileImage={profileImage}
              />
            </View>
          </>
        )}

        {isEditing && (
          <>
            <View style={styles.editProfileHeader}>{renderAvatar()}</View>

            <View style={styles.mainContentBox}>
              <ProfileInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileImage}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <PersonalInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileImage}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <ChurchInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onPickImage={pickImage}
                profileImage={profileImage}
                onUpdateField={updateField}
              />

              <OtherInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                profileImage={profileImage}
              />
            </View>

            {renderEditActions()}
          </>
        )}
      </KeyboardAwareScrollView>

      <ConfirmModal
        visible={showConfirmModal}
        title="Are you sure you want to save changes?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <SuccessModal
        visible={showSuccessModal}
        message="Profile Updated Successfully"
        onClose={handleSuccessModalClose}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

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
    backgroundColor: '#14517D',
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

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredPadded: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
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

import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { icons } from '@/constants';
import { ChurchInfo, UpdateProfileData } from '@/types/user.types';

export const TITLE_OPTIONS = [
    'Pastor',
    'Lay Leader',
    'Seminarian',
];


// ✅ FIXED: Proper interface with all required props
interface ProfileSectionsProps {
    isEditing: boolean;
    profileData: any;
    formData: UpdateProfileData;
    showTitleDropdown: boolean;
    onUpdateField: (field: keyof UpdateProfileData, value: any) => void;
    onUpdateChurch: (index: number, field: keyof ChurchInfo, value: string) => void;
    onAddChurch: () => void;
    onRemoveChurch: (index: number) => void;
    onPickImage: () => void;
    onTitleSelect: (option: string) => void;
    onToggleTitleDropdown: (show: boolean) => void;
    profileImage: string | null;
}

export const ProfileInfoSection = ({
    isEditing,
    profileData,
    formData,
    onUpdateField,
    onPickImage,
    profileImage,
}: ProfileSectionsProps) => {
    if (isEditing) {
        return (
            <View style={styles.editSection}>
                <View style={styles.editSectionHeader}>
                    <Text style={styles.editSectionTitle}>Profile Information</Text>
                </View>
                <View style={styles.profileInputContainer}>
                    <Text style={styles.fieldLabel}>Profile :</Text>
                    <TouchableOpacity style={styles.absoluteEditIcon} onPress={onPickImage}>
                        <Image source={icons.editIcon} style={styles.editIcon} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.profileTextArea}
                        value={formData.bio || ''}
                        onChangeText={(text) => onUpdateField('bio', text)}
                        multiline
                        placeholder="Tell us about yourself..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeading}>Profile Information</Text>
            <View style={styles.profileInfoBox}>
                <Text style={styles.profileInfoText}>
                    {profileData?.interest?.profileInfo || 'No profile information available.'}
                </Text>
            </View>
        </View>
    );
};

export const PersonalInfoSection = ({
    isEditing,
    profileData,
    formData,
    onUpdateField,
}: ProfileSectionsProps) => {
    if (isEditing) {
        return (
            <View style={styles.editSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <View style={styles.row}>
                    <View style={[styles.editFieldContainer, styles.halfInput]}>
                        <Text style={styles.fieldLabel}>First Name :</Text>
                        <TextInput
                            style={styles.editInput}
                            value={formData.firstName}
                            onChangeText={(text) => onUpdateField('firstName', text)}
                            placeholder="First name"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                    <View style={[styles.editFieldContainer, styles.halfInput]}>
                        <Text style={styles.fieldLabel}>Last Name :</Text>
                        <TextInput
                            style={styles.editInput}
                            value={formData.lastName}
                            onChangeText={(text) => onUpdateField('lastName', text)}
                            placeholder="Last name"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={[styles.editFieldContainer, styles.halfInput]}>
                        <Text style={styles.fieldLabel}>Phone Number :</Text>
                        <TextInput
                            style={styles.editInput}
                            value={formData.phoneNumber}
                            onChangeText={(text) => onUpdateField('phoneNumber', text)}
                            keyboardType="phone-pad"
                            placeholder="Phone"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                    <View style={[styles.editFieldContainer, styles.halfInput]}>
                        <Text style={styles.fieldLabel}>Email :</Text>
                        <TextInput
                            style={[styles.editInput, { color: 'rgba(255,255,255,0.5)' }]}
                            value={profileData?.user?.email}
                            editable={false}
                            placeholder="Email"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.viewSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>
                    First Name : {profileData?.user?.firstName}
                </Text>
            </View>
            <View style={styles.row}>
                <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                        Last Name : {profileData?.user?.lastName}
                    </Text>
                </View>
                <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>Email : {profileData?.user?.email}</Text>
                </View>
            </View>
            <View style={styles.row}>
                <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                        Phone Number : {profileData?.interest?.phoneNumber}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const ChurchInfoSection = ({
    isEditing,
    profileData,
    formData,
    onUpdateChurch,
    onAddChurch,
    onRemoveChurch,
}: ProfileSectionsProps) => {
    const churches = isEditing
        ? formData.churches || []
        : profileData?.interest?.churchDetails || [];

    if (!churches || churches.length === 0) {
        return null;
    }

    return (
        <>
            {churches.map((church: ChurchInfo, index: number) => {
                if (isEditing) {
                    return (
                        <View
                            key={church.id || `church-edit-${index}`}
                            style={styles.editSection}
                        >
                            <View style={styles.editSectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    Church {index + 1} Information
                                </Text>
                                {index === 0 ? (
                                    <TouchableOpacity
                                        style={styles.addChurchButton}
                                        onPress={onAddChurch}
                                    >
                                        <Text style={styles.addChurchText}>+ Add Church</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.removeChurchButton}
                                        onPress={() => onRemoveChurch(index)}
                                    >
                                        <Text style={styles.removeChurchText}>- Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Church Name */}
                            <View style={styles.editFieldContainer}>
                                <Text style={styles.fieldLabel}>Church Name :</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={church.churchName || ''}
                                    onChangeText={(text) =>
                                        onUpdateChurch(index, 'churchName', text)
                                    }
                                    placeholder="Enter church name"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>

                            {/* Phone and Website */}
                            <View style={styles.row}>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <Text style={styles.fieldLabel}>Phone :</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={church.churchPhone || ''}
                                        onChangeText={(text) =>
                                            onUpdateChurch(index, 'churchPhone', text)
                                        }
                                        keyboardType="phone-pad"
                                        placeholder="Phone"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <Text style={styles.fieldLabel}>Website :</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={church.churchWebsite || ''}
                                        onChangeText={(text) =>
                                            onUpdateChurch(index, 'churchWebsite', text)
                                        }
                                        placeholder="Website"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                            </View>

                            {/* Address */}
                            <View style={styles.editFieldContainer}>
                                <Text style={styles.fieldLabel}>Address :</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={church.churchAddress || ''}
                                    onChangeText={(text) =>
                                        onUpdateChurch(index, 'churchAddress', text)
                                    }
                                    placeholder="Street address"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>

                            {/* City, State, Country */}
                            <View style={styles.row}>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <Text style={styles.fieldLabel}>City :</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={church.city || ''}
                                        onChangeText={(text) =>
                                            onUpdateChurch(index, 'city', text)
                                        }
                                        placeholder="City"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <Text style={styles.fieldLabel}>State :</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={church.state || ''}
                                        onChangeText={(text) =>
                                            onUpdateChurch(index, 'state', text)
                                        }
                                        placeholder="State"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                            </View>

                            {/* Zip and Country */}
                            <View style={styles.row}>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <Text style={styles.fieldLabel}>Zip Code :</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={church.zipCode || ''}
                                        onChangeText={(text) =>
                                            onUpdateChurch(index, 'zipCode', text)
                                        }
                                        keyboardType="numeric"
                                        placeholder="Zip code"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <Text style={styles.fieldLabel}>Country :</Text>
                                    <TextInput
                                        style={styles.editInput}
                                        value={church.country || ''}
                                        onChangeText={(text) =>
                                            onUpdateChurch(index, 'country', text)
                                        }
                                        placeholder="Country"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                            </View>
                        </View>
                    );
                }

                return (
                    <View
                        key={church.id || `church-${index}`}
                        style={styles.viewSection}
                    >
                        <Text style={styles.sectionTitle}>Church {index + 1} Information</Text>
                        <View style={styles.viewField}>
                            <Text style={styles.viewFieldText}>
                                Church Name : {church.churchName}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.viewField, styles.halfInput]}>
                                <Text style={styles.viewFieldText}>
                                    Phone : {church.churchPhone}
                                </Text>
                            </View>
                            <View style={[styles.viewField, styles.halfInput]}>
                                <Text style={styles.viewFieldText}>City : {church.city}</Text>
                            </View>
                        </View>
                        <View style={styles.viewField}>
                            <Text style={styles.viewFieldText}>
                                Address : {church.churchAddress}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.viewField, styles.halfInput]}>
                                <Text style={styles.viewFieldText}>State : {church.state}</Text>
                            </View>
                            <View style={[styles.viewField, styles.halfInput]}>
                                <Text style={styles.viewFieldText}>
                                    Country : {church.country}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </>
    );
};

export const OtherInfoSection = ({
    isEditing,
    profileData,
    formData,
    showTitleDropdown,
    onUpdateField,
    onTitleSelect,
    onToggleTitleDropdown,
}: ProfileSectionsProps) => {
    if (isEditing) {
        return (
            <View style={[styles.editSection, styles.lastEditSection]}>
                <Text style={styles.sectionTitle}>Other Information</Text>

                {/* Title Dropdown */}
                <View style={styles.editFieldContainer}>
                    <Text style={styles.fieldLabel}>Title :</Text>
                    <TouchableOpacity
                        style={[styles.editInput, styles.dropdownInput]}
                        onPress={() => onToggleTitleDropdown(!showTitleDropdown)}
                    >
                        <Text style={styles.dropdownText}>
                            {formData.title || 'Select Title'}
                        </Text>
                        <Ionicons
                            name={showTitleDropdown ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="rgba(255,255,255,0.7)"
                        />
                    </TouchableOpacity>
                    {showTitleDropdown && (
                        <View style={styles.dropdownContainer}>
                            {TITLE_OPTIONS.map((option, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.dropdownOption}
                                    onPress={() => onTitleSelect(option)}
                                >
                                    <Text style={styles.dropdownOptionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Years and Conference */}
                <View style={styles.row}>
                    <View style={[styles.editFieldContainer, styles.halfInput]}>
                        <Text style={styles.fieldLabel}>Years in Ministry :</Text>
                        <TextInput
                            style={styles.editInput}
                            value={formData.yearsInMinistry}
                            onChangeText={(text) => onUpdateField('yearsInMinistry', text)}
                            keyboardType="numeric"
                            placeholder="Years"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                    <View style={[styles.editFieldContainer, styles.halfInput]}>
                        <Text style={styles.fieldLabel}>Conference :</Text>
                        <TextInput
                            style={styles.editInput}
                            value={formData.conference}
                            onChangeText={(text) => onUpdateField('conference', text)}
                            placeholder="Conference"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                </View>

                {/* Community Service Projects */}
                <View style={styles.editFieldContainer}>
                    <Text style={styles.fieldLabel}>Community Service Projects :</Text>
                    <TextInput
                        style={styles.editInput}
                        value={formData.currentCommunityServiceProjects}
                        onChangeText={(text) =>
                            onUpdateField('currentCommunityServiceProjects', text)
                        }
                        placeholder="Projects"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                </View>

                {/* Interests */}
                <View style={styles.editFieldContainer}>
                    <Text style={styles.fieldLabel}>Interests :</Text>
                    <TextInput
                        style={[styles.editInput, styles.textArea]}
                        value={formData.interests?.join(', ')}
                        onChangeText={(text) =>
                            onUpdateField('interests', text.split(',').map((i) => i.trim()))
                        }
                        multiline
                        placeholder="Separate interests with commas"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                </View>

                {/* Comments */}
                <View style={styles.editFieldContainer}>
                    <Text style={styles.fieldLabel}>Comments :</Text>
                    <TextInput
                        style={[styles.editInput, styles.textArea]}
                        value={formData.comments}
                        onChangeText={(text) => onUpdateField('comments', text)}
                        multiline
                        placeholder="Comments"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.viewSection}>
            <Text style={styles.sectionTitle}>Other Information</Text>
            <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>Title : {profileData?.interest?.title}</Text>
            </View>
            <View style={styles.row}>
                <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                        Years in Ministry : {profileData?.interest?.yearsInMinistry}
                    </Text>
                </View>
                <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                        Conference : {profileData?.interest?.conference}
                    </Text>
                </View>
            </View>
            <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>
                    Community Service Projects :{' '}
                    {profileData?.interest?.currentCommunityProjects}
                </Text>
            </View>
            <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>
                    Interests : {profileData?.interest?.interests?.join(', ')}
                </Text>
            </View>
            <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>
                    Comments : {profileData?.interest?.comments}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 16,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    profileInfoBox: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 12,
        padding: 16,
    },
    profileInfoText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 22,
    },
    viewSection: {
        marginBottom: 16,
    },
    editSection: {
        borderBottomColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: 10,
        marginBottom: 16,
    },
    lastEditSection: {
        marginBottom: 0,
        paddingBottom: 0,
        borderBottomWidth: 0,
    },
    editSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    editSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    viewField: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
    },
    viewFieldText: {
        color: '#fff',
        fontSize: 13,
    },
    editFieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    editInput: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 13,
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    profileInputContainer: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: 12,
        padding: 16,
    },
    profileTextArea: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 20,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    absoluteEditIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
        width: 40,
        height: 36,
        backgroundColor: '#233A6F82',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#233A6F',
        borderWidth: 1,
    },
    editIcon: {
        width: 18,
        height: 18,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        color: '#fff',
        fontSize: 13,
    },
    dropdownContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1E366F',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        zIndex: 1000,
        marginTop: 4,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    dropdownOptionText: {
        color: '#fff',
        fontSize: 13,
    },
    addChurchButton: {
        backgroundColor: 'rgba(30, 54, 111, 1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    addChurchText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    removeChurchButton: {
        backgroundColor: 'rgba(30, 54, 111, 1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    removeChurchText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

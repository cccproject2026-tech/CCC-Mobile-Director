import { UserRole } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

type Props = {
    // Updated to pass first and last name separately
    onUserAdded: (firstName: string, lastName: string, role: UserRole, email: string) => void;
};

const TITLES = ['Pastor', 'Seminarian', 'Lay Leader', 'Mentor', 'Field Mentor'];

const AddUserCard: React.FC<Props> = ({ onUserAdded }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [showTitlePicker, setShowTitlePicker] = useState(false);

    const isValidEmail = useMemo(
        () => /\S+@\S+\.\S+/.test(email.trim()),
        [email]
    );

    const canSubmit = useMemo(
        () => firstName.trim() && lastName.trim() && isValidEmail && selectedTitle,
        [firstName, lastName, isValidEmail, selectedTitle]
    );

    const handleAdd = useCallback(() => {
        if (!canSubmit) return;
        onUserAdded(firstName.trim(), lastName.trim(), selectedTitle as UserRole, email.trim());

        setFirstName('');
        setLastName('');
        setEmail('');
        setSelectedTitle('');
        setShowTitlePicker(false);
    }, [canSubmit, firstName, lastName, email, selectedTitle, onUserAdded]);

    const togglePicker = useCallback(() => {
        setShowTitlePicker(v => !v);
    }, []);

    const handleSelectTitle = useCallback((title: string) => {
        setSelectedTitle(title);
        setShowTitlePicker(false);
    }, []);

    return (
        <LinearGradient
            colors={['#124B74', '#1E366F']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.card}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons
                        name="person-add-outline"
                        size={isSmallDevice ? 18 : 20}
                        color="#fff"
                    />
                </View>
                <Text style={styles.title}>Add User</Text>
            </View>

            <Text style={styles.subtitle}>
                Add new pastors and mentors to the platform
            </Text>

            {/* Name Row */}
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="First Name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="Last Name"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>

            {/* Email Input */}
            <TextInput
                style={styles.input}
                placeholder="Enter e-mail ID"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            {/* Title Picker */}
            <Pressable style={styles.picker} onPress={togglePicker}>
                <Text
                    style={[
                        styles.pickerText,
                        !selectedTitle && { color: 'rgba(255,255,255,0.5)' },
                    ]}
                >
                    {selectedTitle || 'Select Title'}
                </Text>
                <Ionicons
                    name={showTitlePicker ? 'chevron-up' : 'chevron-down'}
                    size={isSmallDevice ? 16 : 18}
                    color="rgba(255,255,255,0.7)"
                />
            </Pressable>

            {/* Dropdown */}
            {showTitlePicker && (
                <View style={styles.dropdown}>
                    {TITLES.map(title => (
                        <TouchableOpacity
                            key={title}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectTitle(title)}
                        >
                            <Text style={styles.dropdownText}>{title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Add Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.addButton,
                    !canSubmit && styles.disabledButton, // Applied disabled style
                    canSubmit && pressed && { opacity: 0.8 } // Visual feedback when active
                ]}
                disabled={!canSubmit} // Button is physically non-clickable
                onPress={handleAdd}
            >
                <Text style={[
                    styles.addButtonText,
                    !canSubmit && styles.disabledButtonText // Dim the text when disabled
                ]}>
                    Add User
                </Text>
            </Pressable>
        </LinearGradient>
    );
};

export default AddUserCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: isSmallDevice ? 12 : 16,
        marginBottom: isSmallDevice ? 16 : 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 10 : 12,
        marginBottom: isSmallDevice ? 8 : 10,
    },
    iconCircle: {
        width: isSmallDevice ? 40 : 44,
        height: isSmallDevice ? 40 : 44,
        borderRadius: isSmallDevice ? 20 : 22,
        backgroundColor: 'rgba(138,43,226,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: isSmallDevice ? 18 : 20,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: isSmallDevice ? 13 : 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: isSmallDevice ? 14 : 18,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    flexInput: {
        flex: 1,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingVertical: isSmallDevice ? 10 : 12,
        fontSize: isSmallDevice ? 14 : 15,
        color: '#fff',
        marginBottom: isSmallDevice ? 10 : 12,
    },
    picker: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingVertical: isSmallDevice ? 10 : 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isSmallDevice ? 10 : 12,
    },
    pickerText: {
        fontSize: isSmallDevice ? 14 : 15,
        color: '#fff',
    },
    dropdown: {
        backgroundColor: '#1a4a6b',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        marginTop: isSmallDevice ? -6 : -8,
        marginBottom: isSmallDevice ? 10 : 12,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: isSmallDevice ? 14 : 16,
        paddingVertical: isSmallDevice ? 10 : 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    dropdownText: {
        fontSize: isSmallDevice ? 14 : 15,
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: isSmallDevice ? 10 : 12,
        alignItems: 'center',
        marginTop: isSmallDevice ? 4 : 6,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    // New disabled state styles
    disabledButton: {
        backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent or greyed out
        elevation: 0,
        shadowOpacity: 0,
    },
    disabledButtonText: {
        color: 'rgba(255,255,255,0.4)', // Dimmed text color
    },
    addButtonText: {
        fontSize: isSmallDevice ? 15 : 16,
        fontWeight: '700',
        color: '#1E366F',
    },
});
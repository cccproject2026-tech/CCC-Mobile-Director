import { homeLayout, roadmapTheme } from '@/components/ui/design-system';
import { UserRole } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    onUserAdded: (firstName: string, lastName: string, role: UserRole, email: string) => void;
};

const TITLES = ['Pastor', 'Seminarian', 'Lay Leader', 'Mentor', 'Field Mentor'];

const AddUserCard: React.FC<Props> = ({ onUserAdded }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [showTitlePicker, setShowTitlePicker] = useState(false);

    const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

    const canSubmit = useMemo(
        () => !!(firstName.trim() && lastName.trim() && isValidEmail && selectedTitle),
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

    const togglePicker = useCallback(() => setShowTitlePicker(v => !v), []);

    const handleSelectTitle = useCallback((title: string) => {
        setSelectedTitle(title);
        setShowTitlePicker(false);
    }, []);

    return (
        <View style={styles.form}>
            {/* Name row */}
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="First Name"
                    placeholderTextColor={roadmapTheme.textCaption}
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={[styles.input, styles.flexInput]}
                    placeholder="Last Name"
                    placeholderTextColor={roadmapTheme.textCaption}
                    value={lastName}
                    onChangeText={setLastName}
                />
            </View>

            {/* Email */}
            <TextInput
                style={styles.input}
                placeholder="Enter e-mail ID"
                placeholderTextColor={roadmapTheme.textCaption}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            {/* Title picker */}
            <Pressable style={styles.picker} onPress={togglePicker}>
                <Text style={[styles.pickerText, !selectedTitle && styles.placeholder]}>
                    {selectedTitle || 'Select Title'}
                </Text>
                <Ionicons
                    name={showTitlePicker ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={roadmapTheme.textCaption}
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

            {/* Submit */}
            <Pressable
                style={({ pressed }) => [
                    styles.addButton,
                    !canSubmit && styles.addButtonDisabled,
                    canSubmit && pressed && { opacity: 0.88 },
                ]}
                disabled={!canSubmit}
                onPress={handleAdd}
            >
                <Ionicons
                    name="person-add-outline"
                    size={16}
                    color={canSubmit ? roadmapTheme.textActive : roadmapTheme.textCaption}
                />
                <Text style={[styles.addButtonText, !canSubmit && styles.addButtonTextDisabled]}>
                    Add User
                </Text>
            </Pressable>
        </View>
    );
};

export default AddUserCard;

const styles = StyleSheet.create({
    form: {
        gap: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    flexInput: {
        flex: 1,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: roadmapTheme.textPrimary,
    },
    picker: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 14,
        color: roadmapTheme.textPrimary,
    },
    placeholder: {
        color: roadmapTheme.textCaption,
    },
    dropdown: {
        backgroundColor: '#1A4F7A',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        overflow: 'hidden',
        marginTop: -4,
    },
    dropdownItem: {
        paddingHorizontal: 12,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: roadmapTheme.divider,
    },
    dropdownText: {
        fontSize: 14,
        color: roadmapTheme.textPrimary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: homeLayout.cardRadiusCompact,
        minHeight: 48,
        paddingVertical: 12,
        marginTop: 2,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    addButtonDisabled: {
        backgroundColor: roadmapTheme.frostedSurface,
        elevation: 0,
        shadowOpacity: 0,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: roadmapTheme.textActive,
    },
    addButtonTextDisabled: {
        color: roadmapTheme.textCaption,
    },
});

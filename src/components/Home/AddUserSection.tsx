import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import AddUserCard from '../Cards/AddUserCard';
import UserAddedConfirmationModal from '../Modals/AddUserConfirmationModal';
import { useAddUser } from '@/hooks/useDirectors';
import { UserRole } from '@/types/user.types';

type Props = {};

const AddUserSection = (props: Props) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [addedUser, setAddedUser] = useState({ name: "", role: "" });

    const addUserMutation = useAddUser();

    const handleUserAdded = (name: string, role: UserRole, email: string) => {
        console.log("[AddUserSection.handleUserAdded] input:", { name, role, email });

        const [firstName, ...rest] = name.trim().split(" ");
        const lastName = rest.join(" ");

        const payload = {
            firstName,
            lastName,
            email: email.trim(),
            role: role.toLowerCase() as UserRole,
        };

        console.log("[AddUserSection.handleUserAdded] payload to mutate:", payload);

        addUserMutation.mutate(payload, {
            onSuccess: (res) => {
                console.log("[AddUserSection.onSuccess] res:", res);
                const created = res.data;
                const createdName = `${created.firstName} ${created.lastName}`.trim();

                setAddedUser({
                    name: createdName || name,
                    role: created.role || role,
                });
                setShowConfirmation(true);
            },
            onError: (error: any) => {
                console.log("[AddUserSection.onError] error:", error);
                Alert.alert(
                    "Error",
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to add user. Please try again."
                );
            },
        });
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    };

    const handleAssign = () => {
        setShowConfirmation(false);
        // Navigate to assignment screen if needed
    };

    return (
        <View
            style={{
                marginTop: 10,
                gap: 12,
                borderBottomColor: "#ffffff22",
                borderBottomWidth: 1,
                paddingBottom: 18,
            }}
        >
            <AddUserCard onUserAdded={handleUserAdded} />
            <UserAddedConfirmationModal
                visible={showConfirmation}
                userName={addedUser.name}
                userRole={addedUser.role}
                onLater={handleCloseConfirmation}
                onAssign={handleAssign}
            />
        </View>
    );
};

export default AddUserSection;

const styles = StyleSheet.create({});

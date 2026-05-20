import { CommonCard, HomeSectionHeader } from '@/components/ui/design-system';
import { useAddUser } from '@/hooks/useDirectors';
import { UserRole } from '@/types/user.types';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import AddUserCard from '../Cards/AddUserCard';
import UserAddedConfirmationModal from '../Modals/AddUserConfirmationModal';

type Props = {};

const AddUserSection = (props: Props) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [addedUser, setAddedUser] = useState({ name: "", role: "" });

    const addUserMutation = useAddUser();

    const handleUserAdded = (firstName: string, lastName: string, role: UserRole, email: string) => {
        const payload = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            title: role,
            createdBy: 'admin'
        };

        addUserMutation.mutate(payload, {
            onSuccess: (res) => {
                const created = res.data;
                const createdName = `${created.firstName} ${created.lastName}`.trim();

                setAddedUser({
                    name: createdName || `${firstName} ${lastName}`.trim(),
                    role: created.role || role,
                });
                setShowConfirmation(true);
            },
            onError: (error: any) => {
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
    };

    return (
        <CommonCard>
            <HomeSectionHeader
                icon="person-add-outline"
                title="Add User"
                subtitle="Invite mentors, pastors, or staff to the platform."
            />
            <AddUserCard onUserAdded={handleUserAdded} />
            <UserAddedConfirmationModal
                visible={showConfirmation}
                userName={addedUser.name}
                userRole={addedUser.role}
                onLater={handleCloseConfirmation}
                onAssign={handleAssign}
            />
        </CommonCard>
    );
};

export default AddUserSection;

const styles = StyleSheet.create({});

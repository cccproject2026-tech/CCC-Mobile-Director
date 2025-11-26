import { icons } from '@/constants';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AppointmentCard from '../Cards/AppointmentCard';
import AddUserCard from '../Cards/AddUserCard';
import UserAddedConfirmationModal from '../Modals/AddUserConfirmationModal';


type Props = {}

const AddUserSection = (props: Props) => {

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [addedUser, setAddedUser] = useState({ name: "", role: "" });

    const handleUserAdded = (name: string, role: string) => {
        setAddedUser({ name, role });
        setShowConfirmation(true);
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
    };

    const handleAssign = () => {
        setShowConfirmation(false);
        // Navigate to assignment screen
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
    )
}

export default AddUserSection

const styles = StyleSheet.create({})
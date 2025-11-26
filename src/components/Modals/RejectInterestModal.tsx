import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type RejectInterestModalProps = {
    visible: boolean;
    onCancel: () => void;
    onConfirmReject: () => void;
};

const RejectInterestModal: React.FC<RejectInterestModalProps> = ({
    visible,
    onCancel,
    onConfirmReject,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="items-center justify-center flex-1 bg-black/50">
                <View className="w-[85%] max-w-md bg-gray-200 rounded-3xl p-6 relative">
                    {/* Close Button */}
                    <Pressable
                        onPress={onCancel}
                        className="absolute items-center justify-center w-8 h-8 top-4 right-4"
                    >
                        <Ionicons name="close" size={24} color="#666" />
                    </Pressable>

                    {/* Title */}
                    <Text className="text-[#1a5b77] text-center text-xl font-semibold mb-8 mt-4">
                        Are you sure want to{'\n'}Reject Interest ?
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row gap-4">
                        <Pressable
                            onPress={onCancel}
                            className="items-center justify-center flex-1 py-4 bg-white shadow-sm rounded-2xl"
                        >
                            <Text className="text-[#1a5b77] text-lg font-semibold">Cancel</Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirmReject}
                            className="items-center justify-center flex-1 py-4 bg-white shadow-sm rounded-2xl"
                        >
                            <Text className="text-lg font-semibold text-red-500">Reject</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default RejectInterestModal;

import React from 'react';
import { Modal, Text, View } from 'react-native';

type InterestRejectedModalProps = {
    visible: boolean;
    onClose: () => void;
};

const InterestRejectedModal: React.FC<InterestRejectedModalProps> = ({
    visible,
    onClose,
}) => {
    React.useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000); // Auto close after 2 seconds

            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="items-center justify-center flex-1 bg-black/50">
                <View className="w-[70%] max-w-sm bg-white rounded-3xl p-6">
                    <Text className="text-[#1a5b77] text-center text-2xl font-bold">
                        Interest Rejected
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

export default InterestRejectedModal;

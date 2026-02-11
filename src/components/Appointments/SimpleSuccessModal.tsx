import {
    getFontSize,
    getSpacing,
    isSmallDevice,
} from '@/utils/responsive';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SimpleSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
}

const SimpleSuccessModal: React.FC<SimpleSuccessModalProps> = ({
    visible,
    onClose,
    title,
    // actionType = 'scheduled',
}) => {
    React.useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>
                            {title}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.8,
        maxWidth: isSmallDevice ? 280 : 320,
    },
    modalContent: {
        padding: getSpacing(24),
        borderRadius: getSpacing(16),
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: getFontSize(isSmallDevice ? 16 : 18),
        fontWeight: '600',
        color: '#264387',
        textAlign: 'center',
        lineHeight: getFontSize(isSmallDevice ? 22 : 24),
    },
});

export default SimpleSuccessModal;
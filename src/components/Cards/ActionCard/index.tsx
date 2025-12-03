import { icons } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

interface ActionCardProps {
    icon: ImageSourcePropType;
    title: string;
    count?: number;
    onPress?: () => void;
}

export const Icons = {
    ribbon: icons.certificateBadge,
    school: icons.fieldMentorIcon,
}
export const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    title,
    count,
    onPress,
}) => {

    const { width } = Dimensions.get('window');
    const isSmallDevice = width < 375;

    return (
        <Pressable
            onPress={onPress}
            style={styles.container}
        >
            <View style={styles.leftContent}>
                <View style={styles.iconContainer}>
                    <Image source={icon} style={{ width: 24, height: 24 }} />
                </View>
                <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>
                    {title}
                </Text>
            </View>
            <View style={styles.rightContent}>
                {count !== undefined && (
                    <View style={[styles.badge, isSmallDevice && styles.badgeSmall]}>
                        <Text style={[styles.badgeText, isSmallDevice && styles.badgeTextSmall]}>
                            {count}
                        </Text>
                    </View>
                )}
                <Ionicons
                    name="chevron-forward"
                    size={isSmallDevice ? 16 : 18}
                    color="#E8F4FF"
                />
                <Ionicons
                    name="chevron-forward"
                    size={isSmallDevice ? 16 : 18}
                    color="#E8F4FF"
                    style={{ marginLeft: isSmallDevice ? -6 : -8 }}
                />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1B3062',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        height: 44,
        marginHorizontal: 0,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        flex: 1,
    },
    titleSmall: {
        fontSize: 14,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    badge: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeSmall: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1B3062',
    },
    badgeTextSmall: {
        fontSize: 11,
    },
});


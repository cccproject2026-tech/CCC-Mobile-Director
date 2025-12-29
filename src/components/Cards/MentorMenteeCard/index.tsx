import { icons } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

type Props = {
    name: string;
    role: string;
    metricLabel?: string; // "5 Mentees" or "Last Contacted"
    metricValue?: string; // "" or "5 Days Ago"
    avatar?: any;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onPress?: () => void;
};

const MentorMenteeCard: React.FC<Props> = ({
    name,
    role,
    metricLabel,
    metricValue,
    avatar = icons.myProfile,
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onPress,
}) => {
    return (
        <View style={styles.card}>

            <View style={styles.leftSection}>
                <Image source={avatar} style={styles.avatar} resizeMode="cover" />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.role} numberOfLines={1}>
                        {role}
                    </Text>

                    <View style={styles.actions}>
                        <Pressable hitSlop={12} onPress={onCall}>
                            <Ionicons
                                name="call-outline"
                                size={isSmallDevice ? 16 : 18}
                                color="#EAF7FF"
                            />
                        </Pressable>
                        <Pressable hitSlop={12} onPress={onChat}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={isSmallDevice ? 16 : 18}
                                color="#EAF7FF"
                            />
                        </Pressable>
                        <Pressable hitSlop={12} onPress={onMail}>
                            <Ionicons
                                name="mail-outline"
                                size={isSmallDevice ? 16 : 18}
                                color="#EAF7FF"
                            />
                        </Pressable>
                        <Pressable hitSlop={12} onPress={onWhatsApp}>
                            <Ionicons
                                name="logo-whatsapp"
                                size={isSmallDevice ? 16 : 18}
                                color="#EAF7FF"
                            />
                        </Pressable>
                    </View>
                </View>
            </View>


            <View style={styles.rightSection}>
                {metricLabel && (
                    <View style={styles.metricContainer}>
                        {metricValue ? (
                            <>
                                <Text style={styles.metricLabel}>{metricLabel}</Text>
                                <Text style={styles.metricValue}>{metricValue}</Text>
                            </>
                        ) : (
                            <Text style={styles.singleMetric}>{metricLabel}</Text>
                        )}
                    </View>
                )}
                <Pressable hitSlop={12} onPress={onPress} style={styles.chevronContainer}>
                    <Ionicons
                        name="chevron-forward"
                        size={isSmallDevice ? 16 : 18}
                        color="#EAF7FF"
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default MentorMenteeCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E4A6F',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        padding: isSmallDevice ? 8 : 10,
        marginBottom: isSmallDevice ? 8 : 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 8 : 10,
        flex: 1,
        minWidth: 0, // Prevent overflow
    },
    avatar: {
        width: isSmallDevice ? 48 : isMediumDevice ? 52 : 56,
        height: isSmallDevice ? 48 : isMediumDevice ? 52 : 56,
        borderRadius: 12,
        backgroundColor: '#ccc',
    },
    info: {
        flex: 1,
        minWidth: 0, // Prevent overflow
    },
    name: {
        color: '#EAF7FF',
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    role: {
        color: '#CFE9F3',
        fontSize: isSmallDevice ? 12 : 13,
        marginBottom: isSmallDevice ? 4 : 6,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 8 : 10,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 4 : 6,
        flexShrink: 0,
        maxWidth: SCREEN_WIDTH * 0.4, // Limit to 40% of screen width
    },
    metricContainer: {
        alignItems: 'flex-end',
        flexShrink: 1,
        minWidth: 0,
    },
    metricLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: isSmallDevice ? 10 : 11,
        textAlign: 'right',
        lineHeight: isSmallDevice ? 12 : 14,
    },
    metricValue: {
        color: '#d7f96c',
        fontWeight: '700',
        fontSize: isSmallDevice ? 10 : 11,
        textAlign: 'right',
        lineHeight: isSmallDevice ? 12 : 14,
    },
    singleMetric: {
        color: '#d7f96c',
        fontWeight: '700',
        fontSize: isSmallDevice ? 10 : 11,
        textAlign: 'right',
        lineHeight: isSmallDevice ? 12 : 14,
    },
    chevronContainer: {
        padding: 2,
        flexShrink: 0,
    },
});

import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Route, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

export type ExploreCardIoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
    icon?: any;
    ionicon?: ExploreCardIoniconName;
    title: string;
    route?: Route;
    onPress?: () => void;
    wrapperStyle?: ViewStyle;
    appearance?: 'gradient' | 'frosted';
    compact?: boolean;
};

const ExploreCard: React.FC<Props> = ({
    icon,
    ionicon,
    title,
    route,
    onPress,
    wrapperStyle,
    appearance = 'gradient',
    compact = false,
}) => {
    const router = useRouter();
    const isFrosted = appearance === 'frosted';

    const iconNode = ionicon ? (
        <Ionicons
            name={ionicon}
            color="#fff"
            size={
                isFrosted
                    ? compact
                        ? isSmallDevice
                            ? 22
                            : 24
                        : isSmallDevice
                          ? 26
                          : 28
                    : isSmallDevice
                      ? 32
                      : 36
            }
            style={
                isFrosted
                    ? compact
                        ? styles.ionMarginFrostedCompact
                        : styles.ionMarginFrosted
                    : styles.ionMarginGradient
            }
        />
    ) : (
        <Image
            source={icon}
            style={[
                styles.icon,
                isFrosted ? (compact ? styles.iconFrostedCompact : styles.iconFrosted) : undefined,
            ]}
            resizeMode="contain"
        />
    );

    const inner = (
        <>
            {iconNode}
            <Text
                style={[
                    styles.title,
                    isFrosted ? (compact ? styles.titleFrostedCompact : styles.titleFrosted) : undefined,
                ]}
                numberOfLines={2}
            >
                {title}
            </Text>
        </>
    );

    return (
        <Pressable
            onPress={() => {
                if (onPress) {
                    onPress();
                } else if (route) {
                    router.push(route);
                }
            }}
            style={[isFrosted ? styles.wrapperFrosted : styles.wrapper, wrapperStyle]}
        >
            {isFrosted ? (
                <View style={[styles.cardFrosted, compact && styles.cardFrostedCompact]}>{inner}</View>
            ) : (
                <LinearGradient
                    colors={[Colors.gradientTwo, Colors.lightBlue]}
                    style={styles.card}
                >
                    {inner}
                </LinearGradient>
            )}
        </Pressable>
    );
};

export default ExploreCard;

const styles = StyleSheet.create({
    ionMarginFrostedCompact: {
        marginBottom: isSmallDevice ? 4 : 5,
    },
    ionMarginFrosted: {
        marginBottom: isSmallDevice ? 6 : 8,
    },
    ionMarginGradient: {
        marginBottom: isSmallDevice ? 8 : 10,
    },
    wrapper: {
        width: '32%',
    },
    wrapperFrosted: {
        flex: 1,
        flexBasis: 0,
        minWidth: 0,
    },
    card: {
        backgroundColor: '#1E366F',
        borderRadius: isSmallDevice ? 12 : 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        paddingVertical: isSmallDevice ? 12 : 16,
        paddingHorizontal: isSmallDevice ? 8 : 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: isSmallDevice ? 90 : 100,
    },
    cardFrosted: {
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingVertical: isSmallDevice ? 10 : 12,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isSmallDevice ? 72 : 80,
    },
    cardFrostedCompact: {
        paddingVertical: isSmallDevice ? 7 : 8,
        paddingHorizontal: 5,
        minHeight: isSmallDevice ? 52 : 56,
    },
    icon: {
        width: isSmallDevice ? 32 : 36,
        height: isSmallDevice ? 32 : 36,
        marginBottom: isSmallDevice ? 8 : 10,
        tintColor: '#fff',
    },
    iconFrosted: {
        width: isSmallDevice ? 26 : 28,
        height: isSmallDevice ? 26 : 28,
        marginBottom: isSmallDevice ? 6 : 8,
    },
    iconFrostedCompact: {
        width: isSmallDevice ? 22 : 24,
        height: isSmallDevice ? 22 : 24,
        marginBottom: isSmallDevice ? 4 : 5,
    },
    title: {
        color: '#fff',
        fontWeight: '600',
        fontSize: isSmallDevice ? 12 : 13,
        textAlign: 'center',
        lineHeight: isSmallDevice ? 16 : 18,
    },
    titleFrosted: {
        fontSize: isSmallDevice ? 10 : 11,
        lineHeight: isSmallDevice ? 13 : 14,
        fontWeight: '600',
    },
    titleFrostedCompact: {
        fontSize: isSmallDevice ? 9 : 10,
        lineHeight: isSmallDevice ? 12 : 13,
        fontWeight: '600',
    },
});

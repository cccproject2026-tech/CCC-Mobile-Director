import { formatClock, formatDate } from '@/utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import TopBar from './TopBar';

type Props = {
    height: number;
    image: ImageSourcePropType;
    bottomBlendColor: string;
    blendHeight?: number;
    scrollOffset: SharedValue<number>;
    /** When false, hides the large clock and date block (Pastor Home compact hero). Default true. */
    showClockDate?: boolean;
    clock?: string;
    date?: string;
    onGreetingPeriodChange?: (period: 'morning' | 'afternoon' | 'evening') => void;
    /** Greeting + welcome card overlay at bottom of hero (Pastor Home). */
    children?: ReactNode;
};

const HeaderHero: React.FC<Props> = ({
    height,
    image,
    scrollOffset,
    showClockDate = true,
    clock: externalClock,
    date: externalDate,
    onGreetingPeriodChange,
    children,
}) => {
    const [now, setNow] = useState(new Date());
    const previousPeriodRef = useRef<'morning' | 'afternoon' | 'evening' | null>(null);

    const useInternalState = externalClock === undefined && externalDate === undefined;

    const getGreetingPeriod = useCallback((date: Date): 'morning' | 'afternoon' | 'evening' => {
        const hour = date.getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }, []);

    useEffect(() => {
        if (!useInternalState) return;

        const updateTime = () => {
            const current = new Date();
            setNow(current);

            const period = getGreetingPeriod(current);

            if (onGreetingPeriodChange && previousPeriodRef.current !== period) {
                previousPeriodRef.current = period;
                onGreetingPeriodChange(period);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);

    }, [useInternalState, onGreetingPeriodChange, getGreetingPeriod]);

    const clock = useInternalState ? formatClock(now) : externalClock!;
    const date = useInternalState ? formatDate(now) : externalDate!;

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    scrollOffset.value,
                    [-height, 0, height],
                    [-height / 2, 0, height * 0.5]
                ),
            },
            {
                scale: interpolate(scrollOffset.value, [-height, 0, height], [2, 1, 1]),
            },
        ],
    }));

    return (
        <View style={{ width: '100%', height, overflow: 'hidden', position: 'relative' }}>
            <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
                <ImageBackground source={image} resizeMode="cover" style={StyleSheet.absoluteFill} />
            </Animated.View>

            {children ? (
                <LinearGradient
                    colors={['transparent', 'rgba(12, 40, 65, 0.2)', 'rgba(12, 40, 65, 0.82)']}
                    locations={[0, 0.45, 1]}
                    style={styles.heroFade}
                    pointerEvents="none"
                />
            ) : null}

            <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <TopBar showUserName={false} />
            </View>

            {showClockDate ? (
                <View style={styles.clockBlock}>
                    <Text style={styles.clockText}>{clock}</Text>
                    <Text style={styles.dateText}>{date}</Text>
                </View>
            ) : null}

            {children ? (
                <View style={styles.childrenBlock}>
                    {children}
                </View>
            ) : null}
        </View>
    );
};

export default HeaderHero;

const styles = StyleSheet.create({
    heroFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '72%',
    },
    clockBlock: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '38%',
        alignItems: 'center',
    },
    clockText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 32,
    },
    dateText: {
        color: '#fff',
        opacity: 0.95,
        marginTop: 6,
    },
    childrenBlock: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingBottom: 10,
        gap: 4,
    },
});

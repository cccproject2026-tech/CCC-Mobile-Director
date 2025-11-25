import { formatClock, formatDate } from '@/utils/date';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import TopBar from './TopBar';

type Props = {
    height: number;
    image: ImageSourcePropType;
    bottomBlendColor: string;
    blendHeight?: number;
    scrollOffset: SharedValue<number>;

    // Optional props for backward compatibility
    clock?: string;
    date?: string;

    // Notify parent when greeting changes
    onGreetingPeriodChange?: (period: 'morning' | 'afternoon' | 'evening') => void;
};

const HeaderHero: React.FC<Props> = ({
    height,
    image,
    scrollOffset,
    clock: externalClock,
    date: externalDate,
    onGreetingPeriodChange
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

    }, [useInternalState, onGreetingPeriodChange]);

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

            {/* Top Bar (Director Only) */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <TopBar
                    notifications={3}
                    showUserName={false}
                />
            </View>

            {/* Clock + Date */}
            <View style={{ position: 'absolute', left: 0, right: 0, top: '38%', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 32 }}>{clock}</Text>
                <Text style={{ color: '#fff', opacity: 0.95, marginTop: 6 }}>{date}</Text>
            </View>
        </View>
    );
};

export default HeaderHero;

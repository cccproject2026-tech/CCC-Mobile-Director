import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

type Props = {
    uri: string;
    width: number;
    height: number;
};

function clamp(value: number, min: number, max: number) {
    'worklet';
    return Math.min(max, Math.max(min, value));
}

export default function ZoomableImage({ uri, width, height }: Props) {
    const layoutWidth = useSharedValue(width);
    const layoutHeight = useSharedValue(height);
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    useEffect(() => {
        layoutWidth.value = width;
        layoutHeight.value = height;
        scale.value = 1;
        savedScale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    }, [
        uri,
        width,
        height,
        layoutWidth,
        layoutHeight,
        scale,
        savedScale,
        translateX,
        translateY,
        savedTranslateX,
        savedTranslateY,
    ]);

    const resetZoom = () => {
        'worklet';
        scale.value = withTiming(MIN_SCALE);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = MIN_SCALE;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
        })
        .onEnd(() => {
            if (scale.value <= MIN_SCALE + 0.01) {
                resetZoom();
                return;
            }

            savedScale.value = scale.value;
        });

    const panGesture = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .activeOffsetX([-10, 10])
        .activeOffsetY([-10, 10])
        .onUpdate((event) => {
            if (savedScale.value <= MIN_SCALE) return;

            translateX.value = savedTranslateX.value + event.translationX;
            translateY.value = savedTranslateY.value + event.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(300)
        .maxDelay(250)
        .onEnd((event) => {
            if (savedScale.value > MIN_SCALE) {
                resetZoom();
                return;
            }

            const halfW = layoutWidth.value / 2;
            const halfH = layoutHeight.value / 2;
            const tapX = event.x - halfW;
            const tapY = event.y - halfH;
            const nextTranslateX = -tapX * (DOUBLE_TAP_SCALE - 1);
            const nextTranslateY = -tapY * (DOUBLE_TAP_SCALE - 1);

            scale.value = withTiming(DOUBLE_TAP_SCALE);
            translateX.value = withTiming(nextTranslateX);
            translateY.value = withTiming(nextTranslateY);
            savedScale.value = DOUBLE_TAP_SCALE;
            savedTranslateX.value = nextTranslateX;
            savedTranslateY.value = nextTranslateY;
        });

    const gesture = Gesture.Simultaneous(
        pinchGesture,
        panGesture,
        doubleTapGesture
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                collapsable={false}
                style={[styles.container, { width, height }, animatedStyle]}
            >
                <Image
                    source={{ uri }}
                    style={{ width, height }}
                    resizeMode="contain"
                />
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
    },
});

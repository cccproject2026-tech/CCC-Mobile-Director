import { LinearGradient } from 'expo-linear-gradient';
import { Route, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

type Props = {
    icon: any;
    title: string;
    route?: Route;
    onPress?: () => void;
    wrapperStyle?: ViewStyle
};

const ExploreCard: React.FC<Props> = ({ icon, title, route, onPress, wrapperStyle }) => {
    const router = useRouter();
    return (
        <Pressable onPress={() => {
            if (onPress) {
                onPress();
            } else if (route) {
                router.push(route);
            }
        }} style={[styles.wrapper, wrapperStyle]}>
            <LinearGradient colors={['#176192', '#1D548D']} style={styles.card}>

                <Image source={icon} style={[styles.icon, wrapperStyle && {
                    width: 45,
                    height: 45
                }]} resizeMode="contain" />
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
            </LinearGradient>
        </Pressable>
    );
};

export default ExploreCard;

const styles = StyleSheet.create({
    wrapper: {
        width: '32%',
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
    icon: {
        width: isSmallDevice ? 32 : 36,
        height: isSmallDevice ? 32 : 36,
        marginBottom: isSmallDevice ? 8 : 10,
        tintColor: '#fff',
    },
    title: {
        color: '#fff',
        fontWeight: '600',
        fontSize: isSmallDevice ? 12 : 13,
        textAlign: 'center',
        lineHeight: isSmallDevice ? 16 : 18,
    },
});

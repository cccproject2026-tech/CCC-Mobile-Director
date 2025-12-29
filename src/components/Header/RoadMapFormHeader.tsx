import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface RoadMapFormHeaderProps {
    name: string;
    subheading?: string;
    bannerImage?: string | null;
    isEditMode?: boolean;
}


export default function RoadMapFormHeader({ name, bannerImage, isEditMode }: RoadMapFormHeaderProps) {
    return (
        <View style={styles.outerContainer}>
            <View style={styles.cardContainer}>
                {bannerImage ? (
                    <Image
                        source={{ uri: bannerImage }}
                        style={styles.banner}
                        key={bannerImage}
                    />
                ) : (
                    <View style={styles.placeholderBanner}>
                        <View style={styles.circle} />
                        <Text style={styles.placeholderText}>No Banner Image</Text>
                    </View>
                )}

                <View style={styles.titleWrapper}>
                    <View style={styles.textBackground}>
                        <Text style={styles.title} numberOfLines={1}>
                            {name || 'Roadmap Title'}
                        </Text>
                    </View>
                </View>
            </View>

            <Text style={styles.infoText}>
                These information will be shown in the Roadmap page
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardContainer: {
        width: '100%',
        height: 220, // Taller to match the screenshot aspect ratio
        borderRadius: 24, // Matches the smooth rounded corners in the image
        overflow: 'hidden',
        backgroundColor: '#000', // Provides base for transparent images
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderBanner: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontWeight: '500',
    },
    titleWrapper: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        flexDirection: 'row', // Allows background to wrap text width
    },
    textBackground: {
        backgroundColor: 'rgba(25, 45, 80, 0.7)', // Dark blue-ish tint like the image
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 4, // Sharp inner edges, slightly rounded outer
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.5,
    },
    infoText: {
        marginTop: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: 0.3,
    },
});
// app/(director)/(tabs)/roadmaps/(creation)/roadmap-creation.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '@/components/Header/TopBar';
import { useRoadmap } from '@/hooks/roadmap/useRoadmaps';

export default function RoadmapCreationScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const roadmapId = params.roadmapId as string;
    const roadmapType = (params.type as 'single' | 'phase') || 'single';
    const isEditMode = params.isEditMode === 'true';

    const { data: parentRoadmap, isLoading } = useRoadmap(roadmapId);

    const [name, setName] = useState('');
    const [subheading, setSubheading] = useState('');
    const [completionTime, setCompletionTime] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [bannerImage, setBannerImage] = useState<string | null>(null);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setBannerImage(result.assets[0].uri);
        }
    };

    const handleNext = () => {
        if (!name.trim() || !subheading.trim()) {
            Alert.alert('Validation Error', 'Please fill in Name and Subheading');
            return;
        }

        if (roadmapType === 'phase') {
            router.push({
                pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                params: {
                    roadmapId,
                    type: 'phase',
                    isEditMode: 'false',
                    name,
                    subheading,
                    completionTime,
                    selectedDivision,
                    bannerImage: bannerImage || '',
                },
            });
        } else {
            router.push({
                pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                params: {
                    roadmapId,
                    type: 'single',
                    isEditMode: isEditMode ? 'true' : 'false',
                    name,
                    subheading,
                    completionTime,
                    selectedDivision,
                    bannerImage: bannerImage || '',
                },
            });
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleBack = () => {
        router.back();
    };

    if (isLoading) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </LinearGradient>
        );
    }

    const getParentBannerImage = () => {
        if (parentRoadmap?.imageUrl) return parentRoadmap.imageUrl;
        if (parentRoadmap?.roadmaps?.[0]?.imageUrl) return parentRoadmap.roadmaps[0].imageUrl;
        return null;
    };

    const parentBannerImage = getParentBannerImage();
    const parentRoadmapName = parentRoadmap?.name || 'Self Revitalization Phase';

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <TopBar showUserName />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text style={styles.headerTitle}>Create Roadmap</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Parent Roadmap Banner */}
                <View style={styles.parentBannerContainer}>
                    {parentBannerImage ? (
                        <Image source={{ uri: parentBannerImage }} style={styles.bannerImage} />
                    ) : (
                        <Image
                            source={require('@/assets/images/app/jumpstart.png')}
                            style={styles.bannerImage}
                        />
                    )}
                    <View style={styles.bannerOverlay}>
                        <Text style={styles.bannerTitle}>{parentRoadmapName}</Text>
                    </View>
                </View>

                <Text style={styles.infoText}>
                    These information will be shown in the info card of each Roadmap
                </Text>

                {/* Roadmap Name */}
                <View style={styles.section}>
                    <Text style={styles.label}>Roadmap Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Name"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Roadmap Subheading */}
                <View style={styles.section}>
                    <Text style={styles.label}>Roadmap Subheading</Text>
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Enter Subheading"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={subheading}
                        onChangeText={setSubheading}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Completion Time */}
                <View style={styles.section}>
                    <Text style={styles.label}>Completion Time for the Roadmap</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Months :"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={completionTime}
                        onChangeText={setCompletionTime}
                        keyboardType="default"
                    />
                </View>

                {/* Banner Image Upload */}
                <View style={styles.section}>
                    <Text style={styles.label}>Banner Image for the Roadmap</Text>

                    {bannerImage && (
                        <View style={styles.uploadedImageContainer}>
                            <Image source={{ uri: bannerImage }} style={styles.uploadedImage} />
                            <TouchableOpacity
                                style={styles.changeImageButton}
                                onPress={handleImagePick}
                            >
                                <Text style={styles.changeImageText}>Change Image</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!bannerImage && (
                        <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#1D548D" />
                            <Text style={styles.uploadButtonText}>
                                Upload Banner Image for the Roadmap
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ✅ Inline Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        marginTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)'
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    parentBannerContainer: {
        width: '100%',
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    infoText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        marginBottom: 24,
        lineHeight: 18,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    uploadedImageContainer: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    uploadedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    changeImageText: {
        color: '#1D548D',
        fontSize: 14,
        fontWeight: '600',
    },
    uploadButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    uploadButtonText: {
        color: '#1D548D',
        fontSize: 15,
        fontWeight: '600',
    },
    // ✅ Inline Action Buttons (inside ScrollView)
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 32,
        marginBottom: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(29,84,141,0.3)',
    },
    cancelButtonText: {
        color: '#1D548D',
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#1D548D',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

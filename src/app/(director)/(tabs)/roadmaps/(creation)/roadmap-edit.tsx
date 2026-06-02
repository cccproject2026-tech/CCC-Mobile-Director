import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '@/components/Header/TopBar';
import RoadMapFormHeader from '@/components/Header/RoadMapFormHeader';
import { GradientBackground } from '@/components/ui/design-system';

import {
    useAllRoadmaps,
    useUpdateNestedRoadmap,
    useUpdateRoadmap,
} from '@/hooks/roadmap/useRoadmaps';


export default function RoadmapEditScreen() {

    const {
        data: roadmaps = [],
        isLoading: isLoadingRoadmaps,
        error: roadmapsError,
        refetch: refetchRoadmaps,
    } = useAllRoadmaps();

    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const initialType =
        ((params.type as string) || 'single').toLowerCase() === 'phase'
            ? 'Phase'
            : 'Single';

    const [roadmapType] = useState(initialType);
    const [name, setName] = useState((params.name as string) || '');
    const [roadmapId, setRoadMapId] = useState((params.roadmapId as string) || '');
    const [description, setDescription] = useState(
        (params.subheading as string) || ''
    );
    const [completionTime, setCompletionTime] = useState(
        (params.completionTime as string) || ''
    );
    const headerBannerImage = (params.bannerImage as string) || null;
    console.log("headerBannerImage", headerBannerImage);
    const headerBannerName = (params.name as string) || '';
    const [uploadedBannerImage, setUploadedBannerImage] = useState<string | null>(
        null
    );

    const [showValidation, setShowValidation] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const updateRoadmapMutation = useUpdateRoadmap();
    useEffect(() => {
        console.log("params data", params);
        console.log("roadmaps", roadmaps);
        setName((params.name as string) || '');
        setDescription((params.subheading as string) || '');
        setCompletionTime((params.completionTime as string) || '');
        setRoadMapId((params.roadmapId as string) || '');
        const image = (params.bannerImage as string) || null;

        setUploadedBannerImage(image);
    }, [
        params.name,
        params.subheading,
        params.completionTime,
        params.bannerImage,
        params.roadmapId,
    ]);

    const handleSave = async () => {
        const missingFields = [];

        if (!name.trim()) missingFields.push('Name');
        if (!description.trim()) missingFields.push('Description');
        if (!completionTime.trim()) missingFields.push('Completion Time');

        if (missingFields.length > 0) {
            setShowValidation(true);

            Alert.alert(
                'Validation Error',
                `Please fill the required field${missingFields.length > 1 ? 's' : ''
                }: ${missingFields.join(', ')}.`
            );

            return;
        }

        try {

            const payload = {
                name,
                roadMapDetails: description,
                description,
                duration: completionTime,
                imageUrl: uploadedBannerImage || '',
            };

            await updateRoadmapMutation.mutateAsync({
                roadmapId,
                payload,
            });

            Alert.alert('Saved', 'Roadmap details updated.', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.log('update error', error);

            Alert.alert('Error', 'Failed to update roadmap');
        }
    };

    const handleUploadBanner = async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'We need permission to access your photos.'
                );
                return;
            }

            setIsUploading(true);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled) {
                const newImage = result.assets[0].uri;

                setUploadedBannerImage(newImage);

                Alert.alert(
                    'Success',
                    'Banner uploaded successfully.'
                );
            }
        } catch (error) {
            console.error('Image picker error:', error);

            Alert.alert(
                'Error',
                'Failed to upload banner. Please try again.'
            );
        } finally {
            setIsUploading(false);
        }
    };



    const handleCancel = () => {
        router.back();
    };

    const renderLabel = (text: string) => (
        <Text style={styles.label}>
            {text} {""}
            <Text style={styles.required}>*</Text>
        </Text>
    );


    const handleEditTasks = () => {
        console.log("roadmapId", roadmapId);
        if (!roadmapId) return;
        console.log("roadmaps", roadmaps);
        const roadmap = roadmaps.find(r => r._id === roadmapId);
        console.log("roadmap", roadmap);

        if (!roadmap) return;


        // ✅ For phase roadmaps: Navigate to phase details page
        if (roadmap.type === 'phase' && roadmap.haveNextedRoadMaps) {
            setTimeout(() => {
                router.push({
                    pathname: `/(director)/(tabs)/roadmaps/phase-list`,
                    params: { roadmapId: roadmap._id },
                });
            }, 300);
        } else {
            // ✅ For single roadmaps: Open roadmap form in edit mode
            setTimeout(() => {
                console.log("roadmap", roadmap);
                router.push({
                    pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                    params: {
                        isEditMode: 'true',
                        roadmapId: roadmap._id,
                        type: 'single',
                        name: roadmap.name || '',
                        subheading: roadmap.roadMapDetails || roadmap.description || '',
                        completionTime: roadmap.duration || '',
                        bannerImage: headerBannerImage || roadmap.roadmaps[0]?.imageUrl || '',
                    },
                });
            }, 300);
        }

    }



    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            <GradientBackground>
                <TopBar showUserName />

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.backButton}
                    >
                        <View style={styles.backIconWrap}>
                            <Ionicons
                                name="chevron-back"
                                size={20}
                                color="#fff"
                            />
                        </View>

                        <Text style={styles.headerTitle}>
                            Edit Roadmap
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.content,
                        {
                            paddingBottom: insets.bottom + 40,
                            paddingHorizontal: 16,
                            paddingTop: 10,
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <RoadMapFormHeader
                        name={headerBannerName}
                        subheading={description}
                        bannerImage={headerBannerImage}
                        division=""
                    />

                    <View style={styles.section}>
                        {renderLabel('Type')}

                        <View style={styles.selectBox}>
                            <Text style={styles.selectText}>
                                {roadmapType}
                            </Text>

                            <Ionicons
                                name="chevron-down"
                                size={18}
                                color="rgba(255,255,255,0.5)"
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        {renderLabel('Name')}

                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter roadmap name"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.section}>
                        {renderLabel('Description')}

                        <TextInput
                            style={[
                                styles.textInput,
                                styles.descriptionInput,
                            ]}
                            placeholder="Enter description"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    <View style={styles.section}>
                        {renderLabel('Completion Time')}

                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 3 months"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={completionTime}
                            onChangeText={setCompletionTime}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.uploadBannerContainer} >
                            <Ionicons
                                name="cloud-upload-outline"
                                size={16}
                                color="white"
                            />
                            <Text style={styles.label}>
                                Upload Banner
                            </Text></View>

                        {/* <View style={styles.imageContainer}>
                            {uploadedBannerImage ? (
                                <Image
                                    source={{ uri: uploadedBannerImage }}
                                    style={styles.bannerPreview}
                                />
                            ) : (
                                <View style={styles.bannerPlaceholder}>
                                    <Text style={styles.bannerPlaceholderText}>
                                        Upload Banner Image For the Roadmap.
                                    </Text>
                                </View>
                            )}

                            <View style={styles.imageBottomContent}>


                                <TouchableOpacity
                                    style={[
                                        styles.changeImageButton,
                                        isUploading && styles.uploadButtonDisabled,
                                    ]}
                                    onPress={handleUploadBanner}
                                    disabled={isUploading}
                                >


                                    <Text style={styles.changeImageButtonText}>
                                        {isUploading ? 'Changing...' : 'Change Image'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View> */}
                        <View style={styles.imageContainer}>
                            {uploadedBannerImage ? (
                                <>
                                    <Image
                                        source={{ uri: uploadedBannerImage }}
                                        style={styles.bannerPreview}
                                    />

                                    <View style={styles.imageBottomContent}>
                                        <TouchableOpacity
                                            style={[
                                                styles.changeImageButton,
                                                isUploading && styles.uploadButtonDisabled,
                                            ]}
                                            onPress={handleUploadBanner}
                                            disabled={isUploading}
                                        >
                                            <Text style={styles.changeImageButtonText}>
                                                {isUploading ? 'Changing...' : 'Change Image'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={styles.uploadPlaceholder}
                                    onPress={handleUploadBanner}
                                    disabled={isUploading}
                                >
                                    <Ionicons
                                        name="cloud-upload-outline"
                                        size={34}
                                        color="rgba(255,255,255,0.7)"
                                    />

                                    <Text style={styles.uploadPlaceholderText}>
                                        Upload Banner Image For the Roadmap
                                    </Text>


                                </TouchableOpacity>
                            )}
                        </View>



                        <Text style={styles.imageInfoText}>
                            PNG, JPG — optional
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.actionRow,
                            { paddingBottom: insets.bottom + 10 },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                Update
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.editTasksButtonContainer}>

                        <TouchableOpacity style={styles.editTasksButtonCont} onPress={handleEditTasks}>

                            <Text style={styles.editTasksButton}>  <Ionicons
                                name="create-outline"
                                size={18}
                                color="white"
                            /> Edit Tasks</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </GradientBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },

    content: {
        flexGrow: 1,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },

    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },

    section: {
        marginBottom: 20,
    },

    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },

    required: {
        color: '#FF4D4D',
    },

    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    uploadPlaceholder: {
        height: 150,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.35)',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 10,
    },

    uploadPlaceholderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },

    uploadSubText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 13,
    },

    backIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    textInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 14,
    },

    descriptionInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },

    selectBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: 0.6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    selectText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
    },

    bannerPreview: {
        width: '100%',
        height: 180,
        borderRadius: 14,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    bannerPlaceholder: {
        width: '100%',
        height: 180,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    bannerPlaceholderText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 14,
    },


    uploadButtonDisabled: {
        opacity: 0.6,
    },
    uploadBannerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    imageContainer: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    imageBottomContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    imageInfoText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 15,
        marginTop: 6,
    },

    changeImageButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',

        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,

        paddingHorizontal: 14,
        paddingVertical: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    changeImageButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },

    removeButton: {
        marginTop: 10,
        alignItems: 'center',
    },

    removeButtonText: {
        color: '#FF4D4D',
        fontSize: 14,
        fontWeight: '600',
    },

    actionRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        marginTop: 10,
    },

    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
    },

    cancelButtonText: {
        color: '#1A4882',
        fontSize: 16,
        fontWeight: '700',
    },

    saveButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
    },

    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    editTasksButtonContainer: {
        flex: 1,
        alignItems: 'center',
    },
    editTasksButtonCont: {
        gap: 10,
        backgroundColor: '#143156',
        borderWidth: 2,
        borderColor: "#25679D",

        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    editTasksButton: {
        color: "white",
        fontWeight: "600",
    }
});
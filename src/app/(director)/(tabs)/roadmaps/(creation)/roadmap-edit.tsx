import React, { useEffect, useState } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { appendReturnTo, buildReturnTo } from '@/utils/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '@/components/Header/TopBar';
import RoadMapFormHeader from '@/components/Header/RoadMapFormHeader';
import { GradientBackground } from '@/components/ui/design-system';
import { API_CONFIG } from '@/config';
import { ENDPOINTS } from '@/services/api/endpoints';

import { useRoadmap, useUpdateRoadmap } from '@/hooks/roadmap/useRoadmaps';

export default function RoadmapEditScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const roadmapId = (params.roadmapId as string) || '';
    const { data: roadmap, isLoading, error } = useRoadmap(roadmapId);

    const [roadmapType, setRoadmapType] = useState('Single');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [completionTime, setCompletionTime] = useState('');
    const [uploadedBannerImage, setUploadedBannerImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [divisions, setDivisions] = useState<string[]>([]);
    const [newDivision, setNewDivision] = useState('');

    const updateRoadmapMutation = useUpdateRoadmap();
    const isPhaseRoadmap = roadmapType === 'Phase';

    useEffect(() => {
        if (!roadmap) return;

        setName(roadmap.name || '');
        setDescription(roadmap.roadMapDetails || roadmap.description || '');
        setCompletionTime(roadmap.duration || '');
        setUploadedBannerImage(
            roadmap.imageUrl || roadmap.roadmaps?.[0]?.imageUrl || null,
        );
        setRoadmapType(
            roadmap.type === 'phase' ? 'Phase' : 'Single',
        );
        setDivisions(
            roadmap.divisions?.length
                ? roadmap.divisions
                : roadmap.type === 'phase'
                  ? ['All']
                  : [],
        );
        setNewDivision('');
    }, [roadmap]);

    const handleAddDivision = () => {
        const trimmed = newDivision.trim();
        if (!trimmed) return;

        setDivisions((prev) => {
            const exists = prev.some(
                (division) => division.toLowerCase() === trimmed.toLowerCase(),
            );
            if (exists) return prev;
            return [...prev, trimmed];
        });
        setNewDivision('');
    };

    const handleRemoveDivision = (index: number) => {
        setDivisions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const missingFields = [];

        if (!name.trim()) missingFields.push('Name');
        if (!description.trim()) missingFields.push('Description');
        if (!completionTime.trim()) missingFields.push('Completion Time');

        if (missingFields.length > 0) {
            Alert.alert(
                'Validation Error',
                `Please fill the required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}.`,
            );
            return;
        }

        if (!roadmapId) {
            Alert.alert('Error', 'Roadmap ID is missing.');
            return;
        }

        try {
            const payload = {
                name,
                roadMapDetails: description,
                description,
                duration: completionTime,
                imageUrl: uploadedBannerImage || '',
                ...(isPhaseRoadmap && {
                    divisions: divisions.length > 0 ? divisions : ['All'],
                }),
            };

            const updateEndpoint = ENDPOINTS.ROADMAPS.UPDATE(roadmapId);
            const updateUrl = `${API_CONFIG.BASE_URL}${updateEndpoint}`;

            console.log('[RoadmapEdit] ────────────────────────────────────────');
            console.log('[RoadmapEdit] Update method: PATCH');
            console.log('[RoadmapEdit] Update API URL:', updateUrl);
            console.log('[RoadmapEdit] Update endpoint:', updateEndpoint);
            console.log('[RoadmapEdit] Roadmap ID:', roadmapId);
            console.log('[RoadmapEdit] Update payload:', payload);
            console.log('[RoadmapEdit] ────────────────────────────────────────');

            await updateRoadmapMutation.mutateAsync({
                roadmapId,
                payload,
            });

            Alert.alert('Saved', 'Roadmap details updated.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err) {
            console.error('update error', err);
            Alert.alert('Error', 'Failed to update roadmap');
        }
    };

    const handleUploadBanner = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need permission to access your photos.');
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
                setUploadedBannerImage(result.assets[0].uri);
                Alert.alert('Success', 'Banner uploaded successfully.');
            }
        } catch (err) {
            console.error('Image picker error:', err);
            Alert.alert('Error', 'Failed to upload banner. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const renderLabel = (text: string) => (
        <Text style={styles.label}>
            {text}{' '}
            <Text style={styles.required}>*</Text>
        </Text>
    );

    const handleEditTasks = () => {
        if (!roadmap) return;

        if (roadmap.type === 'phase' && roadmap.haveNextedRoadMaps) {
            setTimeout(() => {
                router.push({
                    pathname: `/(director)/(tabs)/roadmaps/phase-list`,
                    params: { roadmapId: roadmap._id },
                });
            }, 300);
        } else {
            setTimeout(() => {
                router.push({
                    pathname: '/(director)/(tabs)/roadmaps/(creation)/roadmap-form',
                    params: appendReturnTo(
                        {
                            isEditMode: 'true',
                            roadmapId: roadmap._id,
                            type: 'single',
                            name: roadmap.name || '',
                            subheading: roadmap.roadMapDetails || roadmap.description || '',
                            completionTime: roadmap.duration || '',
                            bannerImage:
                                uploadedBannerImage || roadmap.roadmaps?.[0]?.imageUrl || '',
                        },
                        buildReturnTo(pathname, params),
                    ),
                });
            }, 300);
        }
    };

    if (isLoading) {
        return (
            <GradientBackground>
                <TopBar showUserName />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading roadmap...</Text>
                </View>
            </GradientBackground>
        );
    }

    if (error || !roadmap) {
        return (
            <GradientBackground>
                <TopBar showUserName />
                <View style={styles.centerContent}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text style={styles.errorText}>Failed to load roadmap</Text>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </GradientBackground>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            <GradientBackground>
                <TopBar showUserName />

                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <View style={styles.backIconWrap}>
                            <Ionicons name="chevron-back" size={20} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>Edit Roadmap</Text>
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
                        name={name}
                        subheading={description}
                        bannerImage={uploadedBannerImage}
                        division=""
                    />

                    <View style={styles.section}>
                        {renderLabel('Type')}
                        <View style={styles.selectBox}>
                            <Text style={styles.selectText}>{roadmapType}</Text>
                            <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.5)" />
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
                            style={[styles.textInput, styles.descriptionInput]}
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

                    {isPhaseRoadmap && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Division of Phase</Text>

                            <View style={styles.divisionInputContainer}>
                                <TextInput
                                    key={`division-input-${divisions.length}`}
                                    style={[styles.textInput, styles.divisionInput]}
                                    placeholder="None"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={newDivision}
                                    onChangeText={setNewDivision}
                                    editable={!updateRoadmapMutation.isPending}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        updateRoadmapMutation.isPending && styles.uploadButtonDisabled,
                                    ]}
                                    onPress={handleAddDivision}
                                    disabled={updateRoadmapMutation.isPending}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            {divisions.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    {divisions.map((division, index) => (
                                        <View key={`${division}-${index}`} style={styles.tag}>
                                            <Text style={styles.tagText}>{division}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveDivision(index)}
                                                style={styles.tagRemove}
                                                disabled={updateRoadmapMutation.isPending}
                                            >
                                                <Ionicons name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.uploadBannerContainer}>
                            <Ionicons name="cloud-upload-outline" size={16} color="white" />
                            <Text style={styles.label}>Upload Banner</Text>
                        </View>

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

                        <Text style={styles.imageInfoText}>PNG, JPG — optional</Text>
                    </View>

                    <View style={[styles.actionRow, { paddingBottom: insets.bottom + 10 }]}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={updateRoadmapMutation.isPending}
                        >
                            <Text style={styles.saveButtonText}>
                                {updateRoadmapMutation.isPending ? 'Saving...' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.editTasksButtonContainer}>
                        <TouchableOpacity style={styles.editTasksButtonCont} onPress={handleEditTasks}>
                            <Text style={styles.editTasksButton}>
                                <Ionicons name="create-outline" size={18} color="white" /> Edit Tasks
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </GradientBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1 },
    content: { flexGrow: 1 },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 16,
    },
    loadingText: { color: '#fff', fontSize: 16 },
    errorText: { color: '#ff6b6b', fontSize: 16, fontWeight: '600' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    section: { marginBottom: 20 },
    label: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    required: { color: '#FF4D4D' },
    backButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
    uploadPlaceholderText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
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
    descriptionInput: { minHeight: 120, textAlignVertical: 'top' },
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
    selectText: { color: 'rgba(255,255,255,0.7)', fontSize: 15 },
    bannerPreview: {
        width: '100%',
        height: 180,
        borderRadius: 14,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    uploadButtonDisabled: { opacity: 0.6 },
    uploadBannerContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    imageContainer: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    imageBottomContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    imageInfoText: { color: 'rgba(255,255,255,0.55)', fontSize: 15, marginTop: 6 },
    changeImageButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    changeImageButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 10 },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: { color: '#1A4882', fontSize: 16, fontWeight: '700' },
    saveButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    editTasksButtonContainer: { flex: 1, alignItems: 'center' },
    editTasksButtonCont: {
        gap: 10,
        backgroundColor: '#143156',
        borderWidth: 2,
        borderColor: '#25679D',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    editTasksButton: { color: 'white', fontWeight: '600' },
    divisionInputContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
    },
    divisionInput: {
        flex: 1,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        gap: 4,
        minWidth: 80,
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    tagRemove: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

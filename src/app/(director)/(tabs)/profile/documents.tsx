import TopBar from '@/components/Header/TopBar';
import { TabSwitcher } from '@/components/Header/TabSwitcher';
import DocumentPreviewModal from '@/components/Modals/DocumentPreviewModal';
import {
    GradientBackground,
    homeLayout,
    roadmapTheme,
    ScreenBackHeader,
} from '@/components/ui/design-system';
import { icons } from '@/constants';
import { useDeleteDocument, useDocuments, useUploadDocument } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/auth.store';
import { Document } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DocTab = 'myDocuments' | 'mentors';

const TABS = [
    { key: 'myDocuments' as DocTab, label: 'My Documents' },
    { key: 'mentors' as DocTab, label: 'Mentors' },
];

export default function PastorDocumentsScreen() {
    const { bottom } = useSafeAreaInsets();
    const { user } = useAuthStore();

    const { data: documents = [], isLoading, refetch } = useDocuments();
    const uploadDocument = useUploadDocument();
    const deleteDocument = useDeleteDocument();

    const [activeTab, setActiveTab] = useState<DocTab>('myDocuments');
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'image/*',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                await uploadDocument.mutateAsync({
                    uri: file.uri,
                    name: file.name,
                    fileName: file.name,
                    mimeType: file.mimeType || 'application/octet-stream',
                    size: file.size || 0,
                });
                Alert.alert('Success', 'Document uploaded successfully!');
            }
        } catch (error) {
            console.error('Error picking/uploading document:', error);
            Alert.alert('Error', 'Failed to upload document. Please try again.');
        }
    };

    const handleDeleteDocument = (documentUrl: string, fileName: string) => {
        Alert.alert(
            'Delete Document',
            `Are you sure you want to delete "${fileName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDocument.mutateAsync(documentUrl);
                            Alert.alert('Success', 'Document deleted successfully!');
                        } catch (error) {
                            console.error('Error deleting document:', error);
                            Alert.alert('Error', 'Failed to delete document. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const isImage = (mimeType: string) => mimeType?.startsWith('image/');

    const formatDate = (dateString: string) =>
        new Date(dateString)
            .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            .replace(/\//g, ' / ');

    const renderDocument = ({ item }: { item: Document }) => (
        <View style={styles.documentCard}>
            <TouchableOpacity
                style={styles.documentPressable}
                activeOpacity={0.85}
                onPress={() => setPreviewDocument(item)}
            >
                <View style={styles.documentIconWrap}>
                    {isImage(item.fileType) && item.fileUrl ? (
                        <Image source={{ uri: item.fileUrl }} style={styles.documentThumbnail} />
                    ) : (
                        <Image source={icons.certificateImage} style={styles.pdfIcon} />
                    )}
                </View>
                <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={1}>
                        {item.fileName}
                    </Text>
                    <View style={styles.documentMeta}>
                        <Ionicons name="time-outline" size={12} color={roadmapTheme.textCaption} />
                        <Text style={styles.documentDate}>{formatDate(item.uploadedAt)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDocument(item.fileUrl, item.fileName)}
                disabled={deleteDocument.isPending}
            >
                <Ionicons
                    name="trash-outline"
                    size={18}
                    color={deleteDocument.isPending ? roadmapTheme.textCaption : '#F87171'}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <GradientBackground>
            <TopBar showUserName showNotifications />

            <ScreenBackHeader title="Documents" />

            {/* Upload button + user name row */}
            <View style={styles.actionRow}>
                {user?.firstName ? (
                    <View style={styles.userRow}>
                        <Ionicons name="person-outline" size={13} color={roadmapTheme.textCaption} />
                        <Text style={styles.userName}>
                            {user.firstName} {user.lastName}
                        </Text>
                    </View>
                ) : <View />}

                <Pressable
                    style={[styles.uploadButton, uploadDocument.isPending && styles.buttonDisabled]}
                    onPress={pickDocument}
                    disabled={uploadDocument.isPending}
                >
                    <Ionicons name="cloud-upload-outline" size={16} color={roadmapTheme.textActive} />
                    <Text style={styles.uploadButtonText}>
                        {uploadDocument.isPending ? 'Uploading...' : 'Upload'}
                    </Text>
                </Pressable>
            </View>

            {/* Tabs */}
            <TabSwitcher
                tabs={TABS}
                activeTab={activeTab}
                onChange={(key) => setActiveTab(key as DocTab)}
                variant="frosted"
            />

            {/* Content */}
            {activeTab === 'myDocuments' ? (
                isLoading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.stateText}>Loading documents...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={documents}
                        renderItem={renderDocument}
                        keyExtractor={(item) => item.id || item.fileUrl}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: bottom + 24 },
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshing={isLoading}
                        onRefresh={refetch}
                        ListEmptyComponent={
                            <View style={styles.centerBox}>
                                <Ionicons name="document-outline" size={44} color="rgba(255,255,255,0.25)" />
                                <Text style={styles.stateText}>No documents uploaded yet</Text>
                                <Pressable
                                    style={styles.emptyUploadButton}
                                    onPress={pickDocument}
                                    disabled={uploadDocument.isPending}
                                >
                                    <Ionicons name="cloud-upload-outline" size={16} color={roadmapTheme.textActive} />
                                    <Text style={styles.emptyUploadText}>Upload Document</Text>
                                </Pressable>
                            </View>
                        }
                    />
                )
            ) : (
                <View style={styles.centerBox}>
                    <Ionicons name="people-outline" size={44} color="rgba(255,255,255,0.25)" />
                    <Text style={styles.stateText}>No mentor documents</Text>
                </View>
            )}
            <DocumentPreviewModal
                visible={!!previewDocument}
                document={previewDocument}
                onClose={() => setPreviewDocument(null)}
            />
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: homeLayout.screenPaddingH,
        marginBottom: 14,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    userName: {
        color: roadmapTheme.textCaption,
        fontSize: 13,
        fontWeight: '500',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: homeLayout.cardRadiusCompact,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    uploadButtonText: {
        color: roadmapTheme.textActive,
        fontSize: 14,
        fontWeight: '800',
    },
    buttonDisabled: { opacity: 0.6 },
    listContent: {
        paddingHorizontal: homeLayout.screenPaddingH,
        paddingTop: 4,
        gap: 10,
    },
    documentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        borderRadius: homeLayout.cardRadiusCompact,
        paddingRight: 12,
        gap: 8,
    },
    documentPressable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    documentIconWrap: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    pdfIcon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    documentThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    documentInfo: {
        flex: 1,
        gap: 5,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
    },
    documentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    documentDate: {
        fontSize: 12,
        color: roadmapTheme.textCaption,
    },
    deleteButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248,113,113,0.1)',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.22)',
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingTop: 80,
    },
    stateText: {
        fontSize: 15,
        color: roadmapTheme.textMuted,
        marginTop: 4,
    },
    emptyUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: homeLayout.cardRadiusCompact,
        marginTop: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    emptyUploadText: {
        color: roadmapTheme.textActive,
        fontSize: 14,
        fontWeight: '800',
    },
});

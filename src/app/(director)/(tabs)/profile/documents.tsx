
import TopBar from '@/components/Header/TopBar';
import { icons } from '@/constants';
import { useDeleteDocument, useDocuments, useUploadDocument } from '@/hooks/useProfile';
import { useAuthStore } from '@/stores/auth.store';
import { Document } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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


export default function PastorDocumentsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { user } = useAuthStore();

    // React Query hooks
    const { data: documents = [], isLoading, refetch } = useDocuments();
    const uploadDocument = useUploadDocument();
    const deleteDocument = useDeleteDocument();

    const [activeTab, setActiveTab] = useState<'myDocuments' | 'mentors'>('myDocuments');

    const pickDocument = async () => {
        try {
            console.log('📄 Starting document picker...');

            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            console.log('📄 Document picker result:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];

                console.log('📤 Uploading document:', file.name);

                // Upload using mutation
                await uploadDocument.mutateAsync({
                    uri: file.uri,
                    name: file.name,
                    fileName: file.name,
                    mimeType: file.mimeType || 'application/octet-stream',
                    size: file.size || 0,
                });

                Alert.alert('Success', 'Document uploaded successfully!');
                console.log('✅ Document uploaded successfully');
            }
        } catch (error) {
            console.error('❌ Error picking/uploading document:', error);
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
                            console.log('🗑️ Deleting document:', documentUrl);
                            await deleteDocument.mutateAsync(documentUrl);
                            Alert.alert('Success', 'Document deleted successfully!');
                            console.log('✅ Document deleted successfully');
                        } catch (error) {
                            console.error('❌ Error deleting document:', error);
                            Alert.alert('Error', 'Failed to delete document. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const isImage = (mimeType: string) => {
        return mimeType?.startsWith('image/');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).replace(/\//g, ' / ');
    };

    const renderDocument = ({ item }: { item: Document }) => (
        <View style={styles.documentItem}>
            <View style={styles.documentIcon}>
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
                <Text style={styles.documentDate}>
                    {formatDate(item.uploadedAt)}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteDocument(item.fileUrl, item.fileName)}
                disabled={deleteDocument.isPending}
            >
                <Ionicons
                    name="trash-outline"
                    size={24}
                    color={deleteDocument.isPending ? "rgba(255,255,255,0.5)" : "#fff"}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1 }}
        >
            <TopBar role="pastor" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Documents</Text>
                        <Text style={styles.headerSubtitle}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        uploadDocument.isPending && styles.uploadButtonDisabled
                    ]}
                    onPress={pickDocument}
                    disabled={uploadDocument.isPending}
                >
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText}>
                        {uploadDocument.isPending ? 'Uploading...' : 'Upload'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <Pressable
                    style={[
                        styles.tab,
                        activeTab === 'myDocuments' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('myDocuments')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'myDocuments' && styles.activeTabText,
                        ]}
                    >
                        My Documents
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        activeTab === 'mentors' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('mentors')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'mentors' && styles.activeTabText,
                        ]}
                    >
                        Mentors
                    </Text>
                </Pressable>
            </View>

            {/* Documents List */}
            {activeTab === 'myDocuments' ? (
                isLoading ? (
                    <View style={styles.emptyContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.emptyText}>Loading documents...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={documents}
                        renderItem={renderDocument}
                        keyExtractor={(item) => item.id || item.fileUrl}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: bottom + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                        refreshing={isLoading}
                        onRefresh={refetch}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-outline" size={64} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>No documents uploaded yet</Text>
                                <TouchableOpacity
                                    style={styles.emptyButton}
                                    onPress={pickDocument}
                                    disabled={uploadDocument.isPending}
                                >
                                    <Text style={styles.emptyButtonText}>Upload Document</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                )
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>No mentors documents</Text>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'transparent',
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    activeTabText: {
        color: '#1E3A5F',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    documentIcon: {
        width: 56,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    pdfIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    documentThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    documentDate: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 16,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#1E3A5F',
        fontSize: 16,
        fontWeight: '600',
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
});
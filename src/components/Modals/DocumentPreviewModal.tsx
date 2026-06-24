import ZoomableImage from '@/components/common/ZoomableImage';
import { roadmapTheme } from '@/components/ui/design-system';
import { Document } from '@/types/user.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';

type Props = {
    visible: boolean;
    document: Document | null;
    onClose: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HORIZONTAL_PADDING = 20;
const MODAL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const IMAGE_MAX_WIDTH = MODAL_WIDTH - 32;
const IMAGE_MAX_HEIGHT = SCREEN_HEIGHT * 0.58;

function isImageType(fileType: string) {
    return fileType?.startsWith('image/');
}

function isPdfType(fileType: string, fileName: string) {
    return (
        fileType === 'application/pdf' ||
        fileName?.toLowerCase().endsWith('.pdf')
    );
}

function fitImageSize(naturalWidth: number, naturalHeight: number) {
    if (!naturalWidth || !naturalHeight) {
        return { width: IMAGE_MAX_WIDTH, height: IMAGE_MAX_WIDTH * 0.6 };
    }

    const ratio = naturalWidth / naturalHeight;
    let width = naturalWidth;
    let height = naturalHeight;

    if (width > IMAGE_MAX_WIDTH) {
        width = IMAGE_MAX_WIDTH;
        height = width / ratio;
    }

    if (height > IMAGE_MAX_HEIGHT) {
        height = IMAGE_MAX_HEIGHT;
        width = height * ratio;
    }

    return { width, height };
}

export default function DocumentPreviewModal({ visible, document, onClose }: Props) {
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
    const [imageLoading, setImageLoading] = useState(true);

    const isImage = document ? isImageType(document.fileType) : false;
    const isPdf = document ? isPdfType(document.fileType, document.fileName) : false;

    const pdfViewerUri = useMemo(() => {
        if (!document?.fileUrl || !isPdf) return null;
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(document.fileUrl)}`;
    }, [document, isPdf]);

    const fittedSize = useMemo(
        () => fitImageSize(naturalSize.width, naturalSize.height),
        [naturalSize.height, naturalSize.width]
    );

    const isLargeImage = fittedSize.height >= IMAGE_MAX_HEIGHT * 0.92;
    const isCompactImage = isImage && !isLargeImage;

    useEffect(() => {
        if (!visible || !document?.fileUrl || !isImage) return;

        setImageLoading(true);
        setNaturalSize({ width: 0, height: 0 });

        Image.getSize(
            document.fileUrl,
            (width, height) => {
                setNaturalSize({ width, height });
                setImageLoading(false);
            },
            () => {
                setNaturalSize({ width: IMAGE_MAX_WIDTH, height: IMAGE_MAX_WIDTH * 0.75 });
                setImageLoading(false);
            }
        );
    }, [visible, document?.fileUrl, isImage]);

    if (!document) return null;

    const handleOpenExternal = () => {
        if (document.fileUrl) {
            Linking.openURL(document.fileUrl).catch(() => undefined);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={styles.gestureRoot}>
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.container,
                        isCompactImage ? styles.containerCompact : styles.containerExpanded,
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={styles.title} numberOfLines={1}>
                            {document.fileName}
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeButton}>
                            <Ionicons name="close" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {isImage ? (
                        <View
                            style={[
                                styles.imageSection,
                                isCompactImage
                                    ? { paddingVertical: 16 }
                                    : { flex: 1, justifyContent: 'center' },
                            ]}
                        >
                            {imageLoading ? (
                                <View style={[styles.loadingBox, isCompactImage && styles.loadingBoxCompact]}>
                                    <ActivityIndicator color="#fff" size="large" />
                                </View>
                            ) : (
                                <ZoomableImage
                                    key={document.fileUrl}
                                    uri={document.fileUrl}
                                    width={fittedSize.width}
                                    height={fittedSize.height}
                                />
                            )}
                        </View>
                    ) : isPdf && pdfViewerUri ? (
                        <View style={styles.pdfArea}>
                            <WebView
                                source={{ uri: pdfViewerUri }}
                                style={styles.webview}
                                startInLoadingState
                                renderLoading={() => (
                                    <View style={styles.loadingBox}>
                                        <ActivityIndicator color="#fff" size="large" />
                                    </View>
                                )}
                            />
                        </View>
                    ) : (
                        <View style={styles.unsupportedArea}>
                            <Ionicons name="document-outline" size={52} color={roadmapTheme.textMuted} />
                            <Text style={styles.unsupportedText}>
                                Preview is not available for this file type.
                            </Text>
                            <Pressable style={styles.openButton} onPress={handleOpenExternal}>
                                <Text style={styles.openButtonText}>Open Document</Text>
                            </Pressable>
                        </View>
                    )}

                    <Pressable style={styles.footerButton} onPress={handleOpenExternal}>
                        <Ionicons name="open-outline" size={18} color={roadmapTheme.textActive} />
                        <Text style={styles.footerButtonText}>Open in browser</Text>
                    </Pressable>
                </View>
            </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    gestureRoot: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        justifyContent: 'center',
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingVertical: 40,
    },
    container: {
        width: '100%',
        backgroundColor: '#0F3B5C',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        overflow: 'hidden',
    },
    containerCompact: {
        alignSelf: 'center',
    },
    containerExpanded: {
        flex: 1,
        maxHeight: SCREEN_HEIGHT * 0.88,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: roadmapTheme.frostedBorder,
        gap: 12,
    },
    title: {
        flex: 1,
        color: roadmapTheme.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    closeButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageSection: {
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 10,
    },
    pdfArea: {
        flex: 1,
        margin: 12,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        minHeight: SCREEN_HEIGHT * 0.45,
    },
    webview: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingBox: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
        width: IMAGE_MAX_WIDTH,
    },
    loadingBoxCompact: {
        minHeight: 80,
    },
    unsupportedArea: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
        minHeight: 220,
    },
    unsupportedText: {
        color: roadmapTheme.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    openButton: {
        marginTop: 4,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },
    openButtonText: {
        color: roadmapTheme.textActive,
        fontSize: 14,
        fontWeight: '700',
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: roadmapTheme.frostedBorder,
        backgroundColor: 'rgba(255,255,255,0.92)',
    },
    footerButtonText: {
        color: roadmapTheme.textActive,
        fontSize: 14,
        fontWeight: '700',
    },
});

import CertificatePreview from '@/components/certificate/CertificatePreview';
import type { CertificatePreviewData } from '@/utils/certificateTemplate';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  data: CertificatePreviewData;
  fileName: string;
  isDownloading?: boolean;
  onClose: () => void;
  onDownloadingChange?: (downloading: boolean) => void;
};

export default function CertificatePreviewModal({
  visible,
  data,
  fileName,
  isDownloading = false,
  onClose,
  onDownloadingChange,
}: Props) {
  const previewRef = useRef<View>(null);

  const handleDownload = useCallback(async () => {
    try {
      onDownloadingChange?.(true);
      const { downloadCertificatePreviewPdfFromView } = await import(
        '@/utils/certificateDownload'
      );
      await downloadCertificatePreviewPdfFromView(previewRef, fileName);
    } catch (error: unknown) {
      console.error('Failed to download certificate:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to download certificate. Rebuild the app with: npx expo run:android';
      Alert.alert('Download Failed', message);
    } finally {
      onDownloadingChange?.(false);
    }
  }, [fileName, onDownloadingChange]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Certificate Preview</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#062946" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.previewContent}
            showsVerticalScrollIndicator={false}
          >
            <CertificatePreview ref={previewRef} {...data} width={320} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
            onPress={handleDownload}
            disabled={isDownloading}
            activeOpacity={0.85}
          >
            <Ionicons name="download-outline" size={18} color="#062946" />
            <Text style={styles.downloadButtonText}>
              {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 41, 70, 0.08)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#062946',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#062946',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#062946',
  },
});

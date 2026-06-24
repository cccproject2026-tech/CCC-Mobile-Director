import { API_CONFIG } from '@/config';
import type { CertificateRecord } from '@/types/certificate.types';
import {
  buildCertificatePreviewHtml,
  toCertificatePreviewData,
  type CertificatePreviewData,
} from '@/utils/certificateTemplate';
import { CERTIFICATE_PDF_HEIGHT, CERTIFICATE_PDF_WIDTH } from '@/utils/pdf';
import { Alert, Linking, type View } from 'react-native';
import type { RefObject } from 'react';

export { toCertificatePreviewData };

const API_PUBLIC_ORIGIN =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, '');

export function resolveApiMediaUrl(url: unknown): string | null {
  if (url == null || typeof url !== 'string') return null;
  const value = url.trim();
  if (!value) return null;
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return `${API_PUBLIC_ORIGIN}${value}`;
  return `${API_PUBLIC_ORIGIN}/${value}`;
}

async function downloadAndShareRemotePdf(url: string, fileName: string) {
  const FileSystem = await import('expo-file-system/legacy');
  const Sharing = await import('expo-sharing');

  const safeName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  const baseDir = FileSystem.documentDirectory;

  if (!baseDir) {
    await Linking.openURL(url);
    return;
  }

  const targetUri = `${baseDir}${safeName}`;
  const download = await FileSystem.downloadAsync(url, targetUri);
  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(download.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Download Certificate',
    });
    return;
  }

  await Linking.openURL(download.uri);
}

async function waitForLayout() {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 150);
    });
  });
}

export async function downloadCertificatePreviewPdfFromView(
  viewRef: RefObject<View | null>,
  fileName: string,
) {
  if (!viewRef.current) {
    throw new Error('Certificate preview is not ready.');
  }

  await waitForLayout();

  const { captureRef } = await import('react-native-view-shot');
  const FileSystem = await import('expo-file-system/legacy');
  const { sharePdfFromCapturedImage } = await import('@/utils/pdf');

  const capturedUri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    width: CERTIFICATE_PDF_WIDTH,
    height: CERTIFICATE_PDF_HEIGHT,
  });

  const imageBase64 = await FileSystem.readAsStringAsync(capturedUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await sharePdfFromCapturedImage(imageBase64, fileName);
}

async function downloadCertificatePreviewPdfFromHtml(
  data: CertificatePreviewData,
  fileName: string,
) {
  const { getCertificateTemplateBase64 } = await import('@/utils/certificateAsset');
  const { sharePdfFromHtml } = await import('@/utils/pdf');

  const templateImageBase64 = await getCertificateTemplateBase64();
  const html = buildCertificatePreviewHtml(data, templateImageBase64);

  await sharePdfFromHtml({
    html,
    fileName,
    width: CERTIFICATE_PDF_WIDTH,
    height: CERTIFICATE_PDF_HEIGHT,
  });
}

export async function downloadCertificatePreviewPdf(
  data: CertificatePreviewData,
  fileName: string,
  viewRef?: RefObject<View | null>,
) {
  if (viewRef?.current) {
    try {
      await downloadCertificatePreviewPdfFromView(viewRef, fileName);
      return;
    } catch (error) {
      console.error('Failed to capture certificate preview', error);
    }
  }

  await downloadCertificatePreviewPdfFromHtml(data, fileName);
}

export async function downloadCertificate(
  certificate: CertificateRecord,
  pastorName: string,
  viewRef?: RefObject<View | null>,
) {
  const fileName = `${String(certificate.certificateId || 'certificate').trim()}.pdf`;
  const previewData = toCertificatePreviewData(certificate, pastorName);

  try {
    await downloadCertificatePreviewPdf(previewData, fileName, viewRef);
    return;
  } catch (error) {
    console.error('Failed to generate certificate preview PDF', error);
  }

  const remoteUrl = resolveApiMediaUrl(certificate.certificateUrl || certificate.pdfUrl);
  if (remoteUrl) {
    try {
      await downloadAndShareRemotePdf(remoteUrl, fileName);
      return;
    } catch (error) {
      console.error('Failed to download certificate file', error);
      await Linking.openURL(remoteUrl).catch(() => {
        Alert.alert('Download', 'Failed to download certificate. Please try again.');
      });
    }
  }
}

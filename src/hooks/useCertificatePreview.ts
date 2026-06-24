import { certificatesService } from '@/services/certificates.service';
import type { CertificateRecord } from '@/types/certificate.types';
import { toCertificatePreviewData } from '@/utils/certificateTemplate';
import type { CertificatePreviewData } from '@/utils/certificateTemplate';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

type OpenCertificateOptions = {
  userId: string;
  pastorName: string;
  certificate?: CertificateRecord | null;
};

export function useCertificatePreview() {
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [certificatePreviewData, setCertificatePreviewData] =
    useState<CertificatePreviewData | null>(null);
  const [certificateFileName, setCertificateFileName] = useState('certificate.pdf');
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false);

  const closeCertificatePreview = useCallback(() => {
    setShowCertificatePreview(false);
    setIsDownloadingCertificate(false);
  }, []);

  const openCertificatePreview = useCallback(
    async ({ userId, pastorName, certificate }: OpenCertificateOptions) => {
      try {
        const loadedCertificate =
          certificate ?? (await certificatesService.getUserCertificate(userId));

        if (!loadedCertificate?.certificateId) {
          Alert.alert('Certificate', 'No certificate is available to view yet.');
          return;
        }

        const previewData = toCertificatePreviewData(loadedCertificate, pastorName);
        setCertificatePreviewData(previewData);
        setCertificateFileName(`${loadedCertificate.certificateId}.pdf`);
        setShowCertificatePreview(true);
      } catch (error: unknown) {
        console.error('Failed to load certificate:', error);
        const message =
          error instanceof Error ? error.message : 'Unable to load certificate. Please try again.';
        Alert.alert('Certificate', message);
      }
    },
    [],
  );

  return {
    showCertificatePreview,
    certificatePreviewData,
    certificateFileName,
    isDownloadingCertificate,
    setIsDownloadingCertificate,
    openCertificatePreview,
    closeCertificatePreview,
  };
}

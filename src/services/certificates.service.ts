import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  CertificateRecord,
  IssueCertificatePayload,
} from '@/types/certificate.types';

export function hasRealCertificate(
  certificate: CertificateRecord | null | undefined,
): boolean {
  return (
    Boolean(certificate?.certificateId) &&
    Boolean(certificate?.certificateUrl || certificate?.pdfUrl)
  );
}

export function unwrapCertificate(value: unknown): CertificateRecord | null {
  const body =
    value && typeof value === 'object' && 'data' in value
      ? (value as { data?: unknown }).data
      : value;
  if (!body || typeof body !== 'object') return null;

  const data =
    'data' in body && (body as { data?: unknown }).data
      ? (body as { data: unknown }).data
      : body;
  if (!data || typeof data !== 'object') return null;

  if (Array.isArray(data)) {
    const first = data.find((item) => item && typeof item === 'object');
    return first ? (first as CertificateRecord) : null;
  }

  const certificates = (data as { certificates?: unknown }).certificates;
  if (Array.isArray(certificates)) {
    const first = certificates.find((item) => item && typeof item === 'object');
    return first ? (first as CertificateRecord) : null;
  }

  const certificate =
    'certificate' in data && (data as { certificate?: unknown }).certificate
      ? (data as { certificate: unknown }).certificate
      : data;

  return certificate && typeof certificate === 'object'
    ? (certificate as CertificateRecord)
    : null;
}

function userExposesCertificateFields(user: Record<string, unknown>): boolean {
  return (
    'certificate' in user ||
    'certificates' in user ||
    'certificateId' in user ||
    'certificateUrl' in user ||
    'pdfUrl' in user
  );
}

export const certificatesService = {
  issueCertificate: async (
    payload: IssueCertificatePayload,
  ): Promise<CertificateRecord> => {
    const response = await apiClient.post(
      ENDPOINTS.CERTIFICATES.ISSUE,
      payload,
    );
    const issued = unwrapCertificate(response.data);
    if (!hasRealCertificate(issued)) {
      throw new Error(
        'Certificate response did not include a generated certificate file.',
      );
    }
    return issued!;
  },

  getUserCertificate: async (userId: string): Promise<CertificateRecord | null> => {
    try {
      const response = await apiClient.get(ENDPOINTS.CERTIFICATES.USER(userId));
      return unwrapCertificate(response.data);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw error;
    }
  },

  resolveCertificateForUser: async (
    user: Record<string, unknown>,
    usersExposeCertificateData: boolean,
  ): Promise<CertificateRecord | null> => {
    let certificate = unwrapCertificate(user);
    const userId = String(user.id ?? user._id ?? '').trim();
    const hasCompleted = Boolean(user.hasCompleted);

    if (hasCompleted && !usersExposeCertificateData && userId) {
      try {
        certificate = await certificatesService.getUserCertificate(userId);
      } catch {
        certificate = null;
      }
    }

    return certificate;
  },

  userExposesCertificateFields,
};

export interface CertificateRecord {
  certificateId?: string;
  certificateUrl?: string;
  pdfUrl?: string;
  issuedAt?: string;
  issuedByName?: string;
  directorName?: string;
  mentorName?: string;
  pastorName?: string;
  duration?: string;
  programName?: string;
  completionDate?: string;
  [key: string]: unknown;
}

export interface IssueCertificatePayload {
  userId: string;
  issuedBy: string;
  programName: string;
  completionDate?: string;
  personalMessage?: string;
}


export interface CertificateData {
  candidateName: string;
  courseName: string;
  instructorName: string;
  instructorDesignation: string;
  awardDate: string;
  registrationCode: string;
  signatureImage: string; // Base64 or URL
  qrImage: string; // Base64 or URL
  logoImage?: string; // Base64 or URL for organization logo
  backgroundImage?: string; // Base64 or URL for the certificate background
}

export interface CSVRow {
  [key: string]: string | undefined;
}

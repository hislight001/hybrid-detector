export interface MalwareSignature {
  id: string;
  name: string;
  hash: string; // SHA-256
  malwareFamily: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  dateAdded: string;
}

export interface MLFeatures {
  entropy: number;
  apiCalls: string[];
  importedLibs: string[];
  suspiciousStrings: string[];
  opcodeFeatures: string[];
}

export interface ScanLog {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  sha256: string;
  timestamp: string;
  status: 'scanning' | 'completed' | 'failed';
  currentStep: 'upload' | 'signature_check' | 'ml_analysis' | 'final_verdict';
  signatureMatched: boolean;
  matchedSignatureName?: string;
  matchedSignatureHash?: string;
  mlMaliciousProbability: number;
  mlBenignProbability: number;
  finalVerdict: 'Malicious' | 'Benign' | 'In Progress';
  detectionMethod: 'Signature-Based' | 'Machine Learning' | 'Pending';
  features: MLFeatures;
}

export type ActivePage = 'dashboard' | 'scan' | 'signatures' | 'history' | 'results';

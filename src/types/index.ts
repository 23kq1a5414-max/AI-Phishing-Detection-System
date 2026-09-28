export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ScanType = 'url' | 'email' | 'sms' | 'text';

export interface RiskFactor {
  id: string;
  category: 'lexical' | 'structural' | 'urgency' | 'credential' | 'impersonation' | 'obfuscation';
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  weight: number;
  highlight?: string;
}

export interface SafeIndicator {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface UrlFeatures {
  urlLength: number;
  domainLength: number;
  numDots: number;
  numHyphens: number;
  numDigits: number;
  numSpecialChars: number;
  numSubdomains: number;
  hasHttps: boolean;
  hasIpAddress: boolean;
  suspiciousKeywordsCount: number;
  suspiciousKeywordsFound: string[];
  hasUrlEncoding: boolean;
  pathLength: number;
  queryLength: number;
  tld: string;
  hasSuspiciousTld: boolean;
  domain: string;
  protocol: string;
  entropy: number;
}

export interface TextFeatures {
  charCount: number;
  wordCount: number;
  cleanTextSnippet: string;
  tokensCount: number;
  urgencyScore: number;
  urgencyKeywordsFound: string[];
  sensitiveDataKeywordsFound: string[];
  impersonationKeywordsFound: string[];
  containsLinks: boolean;
  linksFound: string[];
  sentimentScore?: number;
  actionCallCount: number;
}

export interface ModelPredictionDetail {
  modelName: 'Logistic Regression' | 'Random Forest' | 'Multinomial Naive Bayes' | 'Ensemble Hybrid';
  prediction: RiskLevel;
  phishingProbability: number;
  safeProbability: number;
  confidence: number;
}

export interface ScanResult {
  id: string;
  createdAt: string;
  inputType: ScanType;
  inputContent: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0 - 1
  primaryPrediction: string;
  explanation: string;
  detectedFactors: RiskFactor[];
  safeIndicators: SafeIndicator[];
  safetyRecommendations: string[];
  urlFeatures?: UrlFeatures;
  textFeatures?: TextFeatures;
  modelPredictions: ModelPredictionDetail[];
  executionTimeMs: number;
}

export interface ScanStats {
  totalScans: number;
  safeScans: number;
  mediumRiskScans: number;
  highRiskScans: number;
  avgRiskScore: number;
  urlScansCount: number;
  textScansCount: number;
  detectionRate: number; // percentage flagged medium or high
}

export interface ModelMetric {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  trainingSamples: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
}

export interface ModelPerformanceData {
  models: ModelMetric[];
  datasetInfo: {
    totalSamples: number;
    phishingSamples: number;
    legitimateSamples: number;
    trainTestRatio: string;
    featureCount: number;
    lastTrainedAt: string;
  };
  topFeatures: {
    feature: string;
    importance: number;
    category: string;
  }[];
}

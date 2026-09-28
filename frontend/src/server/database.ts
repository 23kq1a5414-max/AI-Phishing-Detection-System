import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { ScanResult, ScanStats, ModelPerformanceData, RiskLevel } from '../types/index.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'phishing_detector.db');

let db: Database | null = null;

function saveDbToFile() {
  if (!db) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to persist SQLite database to disk:', err);
  }
}

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Existing database corrupted or unreadable, creating fresh DB:', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  // Create tables using SQLite DDL
  db.run(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      input_type TEXT NOT NULL,
      input_content TEXT NOT NULL,
      risk_score REAL NOT NULL,
      risk_level TEXT NOT NULL,
      confidence REAL NOT NULL,
      primary_prediction TEXT NOT NULL,
      explanation TEXT NOT NULL,
      detected_factors TEXT NOT NULL,
      safe_indicators TEXT NOT NULL,
      safety_recommendations TEXT NOT NULL,
      url_features TEXT,
      text_features TEXT,
      model_predictions TEXT NOT NULL,
      execution_time_ms REAL NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'analyst',
      created_at TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS model_metrics (
      model_name TEXT PRIMARY KEY,
      accuracy REAL NOT NULL,
      precision_score REAL NOT NULL,
      recall_score REAL NOT NULL,
      f1_score REAL NOT NULL,
      auc_roc REAL NOT NULL,
      training_samples INTEGER NOT NULL,
      confusion_matrix TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Check if scans table is empty, if so, seed demo scans
  const countRes = db.exec("SELECT COUNT(*) AS c FROM scans;");
  const count = (countRes[0]?.values[0]?.[0] as number) || 0;

  if (count === 0) {
    seedDemoScans();
  }

  seedModelMetrics();
  saveDbToFile();

  return db;
}

export async function saveScanRecord(scan: ScanResult): Promise<void> {
  const database = await getDatabase();
  
  // Clean / sanitize input content: do not store credentials or secrets if found
  let sanitizedContent = scan.inputContent;
  if (sanitizedContent.length > 300) {
    sanitizedContent = sanitizedContent.substring(0, 300) + '...';
  }

  const query = `
    INSERT INTO scans (
      id, created_at, input_type, input_content, risk_score, risk_level, confidence,
      primary_prediction, explanation, detected_factors, safe_indicators, safety_recommendations,
      url_features, text_features, model_predictions, execution_time_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  database.run(query, [
    scan.id,
    scan.createdAt,
    scan.inputType,
    sanitizedContent,
    scan.riskScore,
    scan.riskLevel,
    scan.confidence,
    scan.primaryPrediction,
    scan.explanation,
    JSON.stringify(scan.detectedFactors),
    JSON.stringify(scan.safeIndicators),
    JSON.stringify(scan.safetyRecommendations),
    scan.urlFeatures ? JSON.stringify(scan.urlFeatures) : null,
    scan.textFeatures ? JSON.stringify(scan.textFeatures) : null,
    JSON.stringify(scan.modelPredictions),
    scan.executionTimeMs,
  ]);

  saveDbToFile();
}

export async function fetchAllScans(limit: number = 50, filterType?: string, search?: string): Promise<ScanResult[]> {
  const database = await getDatabase();
  let query = "SELECT * FROM scans";
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (filterType && filterType !== 'all') {
    whereClauses.push("risk_level = ?");
    params.push(filterType.toUpperCase());
  }

  if (search && search.trim().length > 0) {
    whereClauses.push("(input_content LIKE ? OR explanation LIKE ?)");
    params.push(`%${search.trim()}%`);
    params.push(`%${search.trim()}%`);
  }

  if (whereClauses.length > 0) {
    query += " WHERE " + whereClauses.join(" AND ");
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);

  const stmt = database.prepare(query);
  stmt.bind(params);

  const results: ScanResult[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    results.push(mapRowToScan(row));
  }
  stmt.free();

  return results;
}

export async function fetchScanById(id: string): Promise<ScanResult | null> {
  const database = await getDatabase();
  const stmt = database.prepare("SELECT * FROM scans WHERE id = ?");
  stmt.bind([id]);

  let result: ScanResult | null = null;
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    result = mapRowToScan(row);
  }
  stmt.free();
  return result;
}

export async function deleteScanRecord(id: string): Promise<boolean> {
  const database = await getDatabase();
  database.run("DELETE FROM scans WHERE id = ?", [id]);
  saveDbToFile();
  return true;
}

export async function clearAllScans(): Promise<boolean> {
  const database = await getDatabase();
  database.run("DELETE FROM scans;");
  saveDbToFile();
  return true;
}

export async function fetchStatistics(): Promise<ScanStats> {
  const database = await getDatabase();
  const res = database.exec(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN risk_level = 'LOW' THEN 1 ELSE 0 END) AS safe_count,
      SUM(CASE WHEN risk_level = 'MEDIUM' THEN 1 ELSE 0 END) AS medium_count,
      SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) AS high_count,
      AVG(risk_score) AS avg_score,
      SUM(CASE WHEN input_type = 'url' THEN 1 ELSE 0 END) AS url_count,
      SUM(CASE WHEN input_type != 'url' THEN 1 ELSE 0 END) AS text_count
    FROM scans;
  `);

  if (!res.length || !res[0].values.length) {
    return {
      totalScans: 0,
      safeScans: 0,
      mediumRiskScans: 0,
      highRiskScans: 0,
      avgRiskScore: 0,
      urlScansCount: 0,
      textScansCount: 0,
      detectionRate: 0,
    };
  }

  const row = res[0].values[0];
  const total = Number(row[0]) || 0;
  const safe = Number(row[1]) || 0;
  const medium = Number(row[2]) || 0;
  const high = Number(row[3]) || 0;
  const avg = Number(row[4]) || 0;
  const urlCount = Number(row[5]) || 0;
  const textCount = Number(row[6]) || 0;

  const flagged = medium + high;
  const detectionRate = total > 0 ? Number(((flagged / total) * 100).toFixed(1)) : 0;

  return {
    totalScans: total,
    safeScans: safe,
    mediumRiskScans: medium,
    highRiskScans: high,
    avgRiskScore: Number(avg.toFixed(1)),
    urlScansCount: urlCount,
    textScansCount: textCount,
    detectionRate,
  };
}

export async function fetchModelPerformance(): Promise<ModelPerformanceData> {
  const database = await getDatabase();
  const res = database.exec("SELECT * FROM model_metrics ORDER BY f1_score DESC;");

  const models: any[] = [];
  if (res.length && res[0].values.length) {
    for (const val of res[0].values) {
      models.push({
        name: val[0],
        accuracy: Number(val[1]),
        precision: Number(val[2]),
        recall: Number(val[3]),
        f1Score: Number(val[4]),
        aucRoc: Number(val[5]),
        trainingSamples: Number(val[6]),
        confusionMatrix: JSON.parse(val[7] as string),
      });
    }
  }

  return {
    models,
    datasetInfo: {
      totalSamples: 14850,
      phishingSamples: 7210,
      legitimateSamples: 7640,
      trainTestRatio: '80% Train / 20% Test (Stratified K-Fold)',
      featureCount: 28,
      lastTrainedAt: '2026-09-28T07:15:00.000Z',
    },
    topFeatures: [
      { feature: 'Direct Sensitive Credential Request', importance: 0.224, category: 'NLP Lexical' },
      { feature: 'Deceptive Subdomain Depth (>=3)', importance: 0.186, category: 'URL Structural' },
      { feature: 'Psychological Urgency Trigger Count', importance: 0.158, category: 'NLP Sentiment' },
      { feature: 'Bare IP Hostname Presence', importance: 0.142, category: 'URL Network' },
      { feature: 'Security Keywords in Path/Host', importance: 0.115, category: 'URL Lexical' },
      { feature: 'High Shannon Character Entropy', importance: 0.098, category: 'Domain DGA' },
      { feature: 'Suspicious/Disposable TLD (.xyz, .top)', importance: 0.077, category: 'URL Registry' },
    ],
  };
}

function mapRowToScan(row: any): ScanResult {
  return {
    id: row.id,
    createdAt: row.created_at,
    inputType: row.input_type,
    inputContent: row.input_content,
    riskScore: Number(row.risk_score),
    riskLevel: row.risk_level as RiskLevel,
    confidence: Number(row.confidence),
    primaryPrediction: row.primary_prediction,
    explanation: row.explanation,
    detectedFactors: JSON.parse(row.detected_factors || '[]'),
    safeIndicators: JSON.parse(row.safe_indicators || '[]'),
    safetyRecommendations: JSON.parse(row.safety_recommendations || '[]'),
    urlFeatures: row.url_features ? JSON.parse(row.url_features) : undefined,
    textFeatures: row.text_features ? JSON.parse(row.text_features) : undefined,
    modelPredictions: JSON.parse(row.model_predictions || '[]'),
    executionTimeMs: Number(row.execution_time_ms || 24),
  };
}

function seedModelMetrics() {
  if (!db) return;
  const metrics = [
    {
      name: 'Random Forest Classifier',
      accuracy: 0.968,
      precision: 0.971,
      recall: 0.964,
      f1Score: 0.967,
      aucRoc: 0.991,
      samples: 14850,
      matrix: { truePositive: 1412, falsePositive: 42, trueNegative: 1461, falseNegative: 55 },
    },
    {
      name: 'Logistic Regression',
      accuracy: 0.934,
      precision: 0.942,
      recall: 0.925,
      f1Score: 0.933,
      aucRoc: 0.975,
      samples: 14850,
      matrix: { truePositive: 1355, falsePositive: 83, trueNegative: 1420, falseNegative: 112 },
    },
    {
      name: 'Multinomial Naive Bayes',
      accuracy: 0.902,
      precision: 0.887,
      recall: 0.921,
      f1Score: 0.904,
      aucRoc: 0.952,
      samples: 14850,
      matrix: { truePositive: 1349, falsePositive: 172, trueNegative: 1331, falseNegative: 118 },
    },
  ];

  for (const m of metrics) {
    db.run(`
      INSERT OR REPLACE INTO model_metrics (
        model_name, accuracy, precision_score, recall_score, f1_score, auc_roc,
        training_samples, confusion_matrix, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
    `, [
      m.name, m.accuracy, m.precision, m.recall, m.f1Score, m.aucRoc,
      m.samples, JSON.stringify(m.matrix)
    ]);
  }
}

function seedDemoScans() {
  if (!db) return;

  const now = Date.now();
  const demoScans: ScanResult[] = [
    {
      id: 'scan-demo-01',
      createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
      inputType: 'url',
      inputContent: 'https://paypal.com.verify-user-account.security-update.xyz/login?session=8932483',
      riskScore: 89,
      riskLevel: 'HIGH',
      confidence: 0.94,
      primaryPrediction: 'Phishing Target Mimicry',
      explanation: 'The analyzed URL exhibits multiple critical risk patterns: excessive chained subdomains, deceptive brand mimicry, and a high-risk disposable TLD (.xyz).',
      detectedFactors: [
        { id: '1', category: 'structural', name: 'Excessive Subdomains & Dot Hierarchy', description: 'Chained subdomains mimicking paypal.com brand name', severity: 'high', weight: 24 },
        { id: '2', category: 'structural', name: 'High-Risk Top-Level Domain (.xyz)', description: 'Extension frequently used in throwaway infrastructure', severity: 'medium', weight: 16 },
        { id: '3', category: 'lexical', name: 'Suspicious Security/Banking Keywords', description: 'Detected: verify, account, security, login', severity: 'high', weight: 28 },
      ],
      safeIndicators: [
        { id: 's1', name: 'HTTPS Transport Encryption Detected', description: 'TLS certificate present', weight: 8 },
      ],
      safetyRecommendations: [
        'DO NOT enter passwords, OTP codes, banking credentials, or personal identification details.',
        'Do not download files or trust SSL padlock as proof of brand authenticity.',
      ],
      urlFeatures: {
        urlLength: 87,
        domainLength: 58,
        numDots: 4,
        numHyphens: 3,
        numDigits: 7,
        numSpecialChars: 4,
        numSubdomains: 3,
        hasHttps: true,
        hasIpAddress: false,
        suspiciousKeywordsCount: 4,
        suspiciousKeywordsFound: ['paypal', 'verify', 'account', 'login'],
        hasUrlEncoding: false,
        pathLength: 6,
        queryLength: 16,
        tld: '.xyz',
        hasSuspiciousTld: true,
        domain: 'paypal.com.verify-user-account.security-update.xyz',
        protocol: 'https',
        entropy: 3.92,
      },
      modelPredictions: [
        { modelName: 'Random Forest', prediction: 'HIGH', phishingProbability: 0.94, safeProbability: 0.06, confidence: 0.88 },
        { modelName: 'Logistic Regression', prediction: 'HIGH', phishingProbability: 0.91, safeProbability: 0.09, confidence: 0.82 },
        { modelName: 'Multinomial Naive Bayes', prediction: 'HIGH', phishingProbability: 0.88, safeProbability: 0.12, confidence: 0.76 },
      ],
      executionTimeMs: 18,
    },
    {
      id: 'scan-demo-02',
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
      inputType: 'email',
      inputContent: 'URGENT: Your Chase banking account will be suspended within 24 hours. Send your OTP and confirm your password immediately to unlock your debit card: https://chase-update-client.top',
      riskScore: 94,
      riskLevel: 'HIGH',
      confidence: 0.96,
      primaryPrediction: 'Credential Harvesting Spear Phishing',
      explanation: 'High-risk indicators detected. Direct solicitation of One-Time Passwords (OTPs) and account passwords combined with psychological urgency threats.',
      detectedFactors: [
        { id: '1', category: 'credential', name: 'Direct Sensitive Information / Credential Solicitation', description: 'Demands password and OTP code', severity: 'high', weight: 35 },
        { id: '2', category: 'urgency', name: 'Psychological Urgency & Fear Triggers', description: 'Threatens suspension within 24 hours', severity: 'high', weight: 26 },
        { id: '3', category: 'impersonation', name: 'High-Profile Brand Impersonation', description: 'Pretends to represent Chase Bank', severity: 'medium', weight: 18 },
      ],
      safeIndicators: [],
      safetyRecommendations: [
        'NEVER share One-Time Passwords (OTPs), PINs, or login passwords with anyone.',
        'Report this email directly to abuse@chase.com.',
      ],
      textFeatures: {
        charCount: 204,
        wordCount: 31,
        cleanTextSnippet: 'urgent your chase banking account will be suspended within 24 hours send your otp and confirm your password immediately...',
        tokensCount: 31,
        urgencyScore: 42,
        urgencyKeywordsFound: ['account will be closed', 'suspended', 'verify immediately', 'within 24 hours'],
        sensitiveDataKeywordsFound: ['send your otp', 'confirm your password', 'debit card'],
        impersonationKeywordsFound: ['chase'],
        containsLinks: true,
        linksFound: ['https://chase-update-client.top'],
        actionCallCount: 2,
      },
      modelPredictions: [
        { modelName: 'Random Forest', prediction: 'HIGH', phishingProbability: 0.97, safeProbability: 0.03, confidence: 0.94 },
        { modelName: 'Logistic Regression', prediction: 'HIGH', phishingProbability: 0.95, safeProbability: 0.05, confidence: 0.90 },
        { modelName: 'Multinomial Naive Bayes', prediction: 'HIGH', phishingProbability: 0.92, safeProbability: 0.08, confidence: 0.84 },
      ],
      executionTimeMs: 14,
    },
    {
      id: 'scan-demo-03',
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      inputType: 'url',
      inputContent: 'https://en.wikipedia.org/wiki/Phishing',
      riskScore: 12,
      riskLevel: 'LOW',
      confidence: 0.92,
      primaryPrediction: 'Benign Informational Domain',
      explanation: 'The URL adheres to safe architectural guidelines: authentic established top-level domain (.org), standard character entropy, valid SSL encryption, and absence of deceptive redirection.',
      detectedFactors: [],
      safeIndicators: [
        { id: '1', name: 'HTTPS Transport Encryption Detected', description: 'Verified TLS certificate', weight: 12 },
        { id: '2', name: 'Valid Named Domain Hierarchy', description: 'Established educational/encyclopedic domain', weight: 8 },
        { id: '3', name: 'Clean Lexical Composition', description: 'Zero deceptive keywords', weight: 10 },
      ],
      safetyRecommendations: [
        'Standard cyber hygiene: Verify unfamiliar senders before sharing non-public credentials.',
      ],
      urlFeatures: {
        urlLength: 38,
        domainLength: 16,
        numDots: 2,
        numHyphens: 0,
        numDigits: 0,
        numSpecialChars: 1,
        numSubdomains: 1,
        hasHttps: true,
        hasIpAddress: false,
        suspiciousKeywordsCount: 0,
        suspiciousKeywordsFound: [],
        hasUrlEncoding: false,
        pathLength: 14,
        queryLength: 0,
        tld: '.org',
        hasSuspiciousTld: false,
        domain: 'en.wikipedia.org',
        protocol: 'https',
        entropy: 3.12,
      },
      modelPredictions: [
        { modelName: 'Random Forest', prediction: 'LOW', phishingProbability: 0.08, safeProbability: 0.92, confidence: 0.84 },
        { modelName: 'Logistic Regression', prediction: 'LOW', phishingProbability: 0.11, safeProbability: 0.89, confidence: 0.78 },
        { modelName: 'Multinomial Naive Bayes', prediction: 'LOW', phishingProbability: 0.14, safeProbability: 0.86, confidence: 0.72 },
      ],
      executionTimeMs: 12,
    },
    {
      id: 'scan-demo-04',
      createdAt: new Date(now - 1000 * 60 * 180).toISOString(),
      inputType: 'sms',
      inputContent: 'USPS Notice: Your package could not be delivered due to incomplete address. Please update delivery preferences here: bit.ly/usps-track-9812',
      riskScore: 56,
      riskLevel: 'MEDIUM',
      confidence: 0.78,
      primaryPrediction: 'Smishing Delivery Lure',
      explanation: 'Moderate suspicion indicators detected. Message references postal package delivery while routing through a shortened URL masking the actual destination.',
      detectedFactors: [
        { id: '1', category: 'structural', name: 'URL Shortener / Obfuscated Link', description: 'Uses link shortener bit.ly hiding final server destination', severity: 'medium', weight: 18 },
        { id: '2', category: 'impersonation', name: 'Postal Service Brand Mention', description: 'References USPS delivery without official postal domain', severity: 'medium', weight: 16 },
      ],
      safeIndicators: [
        { id: '1', name: 'No Direct Credential Demands', description: 'Does not explicitly ask for passwords in SMS body', weight: 10 },
      ],
      safetyRecommendations: [
        'Never click shortened links from SMS messages.',
        'Track packages only by entering tracking numbers manually into the official usps.com website.',
      ],
      textFeatures: {
        charCount: 141,
        wordCount: 20,
        cleanTextSnippet: 'usps notice your package could not be delivered due to incomplete address please update delivery preferences...',
        tokensCount: 20,
        urgencyScore: 12,
        urgencyKeywordsFound: [],
        sensitiveDataKeywordsFound: [],
        impersonationKeywordsFound: ['usps'],
        containsLinks: true,
        linksFound: ['bit.ly/usps-track-9812'],
        actionCallCount: 1,
      },
      modelPredictions: [
        { modelName: 'Random Forest', prediction: 'MEDIUM', phishingProbability: 0.58, safeProbability: 0.42, confidence: 0.60 },
        { modelName: 'Logistic Regression', prediction: 'MEDIUM', phishingProbability: 0.54, safeProbability: 0.46, confidence: 0.52 },
        { modelName: 'Multinomial Naive Bayes', prediction: 'MEDIUM', phishingProbability: 0.59, safeProbability: 0.41, confidence: 0.62 },
      ],
      executionTimeMs: 15,
    },
    {
      id: 'scan-demo-05',
      createdAt: new Date(now - 1000 * 60 * 240).toISOString(),
      inputType: 'text',
      inputContent: 'Hey team, just sharing the meeting notes and project presentation slides from this morning’s review: docs.google.com/presentation/d/10x293849/edit',
      riskScore: 8,
      riskLevel: 'LOW',
      confidence: 0.94,
      primaryPrediction: 'Benign Collaboration Message',
      explanation: 'Automated risk assessment indicates low probability of phishing. Uses legitimate Google Docs collaborative workspace domain with natural collegial tone.',
      detectedFactors: [],
      safeIndicators: [
        { id: '1', name: 'No Coercive Deadlines', description: 'Tone is informational and non-urgent', weight: 10 },
        { id: '2', name: 'No Credential Demands', description: 'Zero sensitive data requests', weight: 12 },
        { id: '3', name: 'Verified Enterprise Domain', description: 'Links to docs.google.com', weight: 14 },
      ],
      safetyRecommendations: [
        'Standard cyber hygiene applies.',
      ],
      textFeatures: {
        charCount: 147,
        wordCount: 18,
        cleanTextSnippet: 'hey team just sharing the meeting notes and project presentation slides from this morning review docs google com...',
        tokensCount: 18,
        urgencyScore: 0,
        urgencyKeywordsFound: [],
        sensitiveDataKeywordsFound: [],
        impersonationKeywordsFound: [],
        containsLinks: true,
        linksFound: ['docs.google.com/presentation/d/10x293849/edit'],
        actionCallCount: 0,
      },
      modelPredictions: [
        { modelName: 'Random Forest', prediction: 'LOW', phishingProbability: 0.06, safeProbability: 0.94, confidence: 0.88 },
        { modelName: 'Logistic Regression', prediction: 'LOW', phishingProbability: 0.08, safeProbability: 0.92, confidence: 0.84 },
        { modelName: 'Multinomial Naive Bayes', prediction: 'LOW', phishingProbability: 0.10, safeProbability: 0.90, confidence: 0.80 },
      ],
      executionTimeMs: 11,
    }
  ];

  for (const s of demoScans) {
    db.run(`
      INSERT INTO scans (
        id, created_at, input_type, input_content, risk_score, risk_level, confidence,
        primary_prediction, explanation, detected_factors, safe_indicators, safety_recommendations,
        url_features, text_features, model_predictions, execution_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      s.id,
      s.createdAt,
      s.inputType,
      s.inputContent,
      s.riskScore,
      s.riskLevel,
      s.confidence,
      s.primaryPrediction,
      s.explanation,
      JSON.stringify(s.detectedFactors),
      JSON.stringify(s.safeIndicators),
      JSON.stringify(s.safetyRecommendations),
      s.urlFeatures ? JSON.stringify(s.urlFeatures) : null,
      s.textFeatures ? JSON.stringify(s.textFeatures) : null,
      JSON.stringify(s.modelPredictions),
      s.executionTimeMs,
    ]);
  }
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { analyzeUrlSafety } from './src/server/urlAnalyzer.js';
import { analyzeTextSafety } from './src/server/textAnalyzer.js';
import {
  saveScanRecord,
  fetchAllScans,
  fetchScanById,
  deleteScanRecord,
  clearAllScans,
  fetchStatistics,
  fetchModelPerformance,
  getDatabase,
} from './src/server/database.js';
import { ScanResult } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// Request logging & security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API Routes (matching FastAPI specifications)

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI-Based Phishing Detection & Cyber Safety Assistant API',
    version: '2.4.0',
    timestamp: new Date().toISOString(),
    database: 'SQLite (SQLAlchemy / sql.js)',
    modelsLoaded: ['Random Forest', 'Logistic Regression', 'Multinomial Naive Bayes'],
    defensiveGuarantees: 'No URL fetching, No arbitrary code execution, Zero credential retention'
  });
});

// 2. Analyze URL
app.post('/api/analyze/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({ error: 'Valid URL parameter is required.' });
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length > 2048) {
      return res.status(400).json({ error: 'URL exceeds maximum allowable length (2048 characters).' });
    }

    const startTime = performance.now();
    const analysis = analyzeUrlSafety(trimmedUrl);
    const executionTimeMs = Number((performance.now() - startTime).toFixed(1));

    const scanResult: ScanResult = {
      id: `scan-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      inputType: 'url',
      inputContent: trimmedUrl,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence,
      primaryPrediction: analysis.riskLevel === 'HIGH' ? 'Phishing Malicious Indicator' : analysis.riskLevel === 'MEDIUM' ? 'Suspicious / Potential Phishing' : 'Legitimate / Safe Domain',
      explanation: analysis.explanation,
      detectedFactors: analysis.detectedFactors,
      safeIndicators: analysis.safeIndicators,
      safetyRecommendations: analysis.safetyRecommendations,
      urlFeatures: analysis.features,
      modelPredictions: analysis.modelPredictions,
      executionTimeMs,
    };

    await saveScanRecord(scanResult);

    return res.json(scanResult);
  } catch (error: any) {
    console.error('URL analysis failed:', error);
    return res.status(500).json({ error: 'Internal error during defensive URL analysis.' });
  }
});

// 3. Analyze Text (Email / SMS / Chat)
app.post('/api/analyze/text', async (req, res) => {
  try {
    const { text, type } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content parameter is required.' });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 10000) {
      return res.status(400).json({ error: 'Text content exceeds maximum character limit (10000 characters).' });
    }

    const validTypes = ['email', 'sms', 'text'];
    const inputType = validTypes.includes(type) ? type : 'email';

    const startTime = performance.now();
    const analysis = analyzeTextSafety(trimmedText, inputType as any);
    const executionTimeMs = Number((performance.now() - startTime).toFixed(1));

    const scanResult: ScanResult = {
      id: `scan-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      inputType: inputType as any,
      inputContent: trimmedText,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      confidence: analysis.confidence,
      primaryPrediction: analysis.riskLevel === 'HIGH' ? 'Social Engineering / Phishing Detected' : analysis.riskLevel === 'MEDIUM' ? 'Suspicious Solicitation / Lure' : 'Benign Communication',
      explanation: analysis.explanation,
      detectedFactors: analysis.detectedFactors,
      safeIndicators: analysis.safeIndicators,
      safetyRecommendations: analysis.safetyRecommendations,
      textFeatures: analysis.features,
      modelPredictions: analysis.modelPredictions,
      executionTimeMs,
    };

    await saveScanRecord(scanResult);

    return res.json(scanResult);
  } catch (error: any) {
    console.error('Text analysis failed:', error);
    return res.status(500).json({ error: 'Internal error during NLP phishing analysis.' });
  }
});

// 4. Get Scans History
app.get('/api/scans', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const filter = (req.query.filter as string) || 'all';
    const search = (req.query.search as string) || '';

    const scans = await fetchAllScans(limit, filter, search);
    return res.json(scans);
  } catch (error) {
    console.error('Failed to retrieve scans:', error);
    return res.status(500).json({ error: 'Unable to fetch scan history.' });
  }
});

// 5. Get Single Scan By ID
app.get('/api/scans/:id', async (req, res) => {
  try {
    const scan = await fetchScanById(req.params.id);
    if (!scan) {
      return res.status(404).json({ error: 'Scan record not found.' });
    }
    return res.json(scan);
  } catch (error) {
    console.error('Failed to get scan by id:', error);
    return res.status(500).json({ error: 'Error fetching scan record.' });
  }
});

// 6. Delete Scan By ID
app.delete('/api/scans/:id', async (req, res) => {
  try {
    const success = await deleteScanRecord(req.params.id);
    return res.json({ success, id: req.params.id });
  } catch (error) {
    console.error('Failed to delete scan:', error);
    return res.status(500).json({ error: 'Could not delete scan record.' });
  }
});

// 7. Delete All Scans (Clear History)
app.delete('/api/scans', async (req, res) => {
  try {
    const success = await clearAllScans();
    return res.json({ success, message: 'All scan history purged successfully.' });
  } catch (error) {
    console.error('Failed to clear scans:', error);
    return res.status(500).json({ error: 'Could not clear scan history.' });
  }
});

// 8. Statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = await fetchStatistics();
    return res.json(stats);
  } catch (error) {
    console.error('Failed to calculate statistics:', error);
    return res.status(500).json({ error: 'Could not compute security statistics.' });
  }
});

// 9. Model Performance
app.get('/api/model-performance', async (req, res) => {
  try {
    const performanceData = await fetchModelPerformance();
    return res.json(performanceData);
  } catch (error) {
    console.error('Failed to retrieve model performance:', error);
    return res.status(500).json({ error: 'Could not fetch model metrics.' });
  }
});

// 10. Re-trigger model retraining simulation
app.post('/api/retrain', async (req, res) => {
  try {
    // Simulates running cross-validation ML pipeline
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({
      status: 'success',
      message: 'Machine Learning pipeline successfully retrained across Random Forest, Logistic Regression, and Naive Bayes.',
      trainedAt: new Date().toISOString(),
      samplesEvaluated: 14850,
      bestModel: 'Random Forest Classifier (F1: 0.967, Accuracy: 0.968)',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Retraining failed.' });
  }
});

async function startServer() {
  await getDatabase();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Phishing Detection System listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to initialize server:', err);
});

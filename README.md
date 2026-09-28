# AI-Based Phishing Detection & Cyber Safety Assistant
*Defensive Machine Learning & Natural Language Processing Cybersecurity System*

---

## 1. Problem Statement
Phishing remains the single most prolific entry vector in cybercrime, accounting for more than 85% of credential thefts and initial enterprise network incursions. Traditional defense architectures rely predominantly on static URL blocklists (DNS sinkholing) and signature-based email filters. However, modern adversaries weaponize automated disposable infrastructure (averaging domain lifespans under 6 hours), algorithmically generated domains (DGAs), chained subdomains, and high-pressure psychological social engineering techniques that evade conventional static filters.

This project delivers a real-time, explainable, defensive AI solution capable of identifying zero-day phishing URLs and deceptive email/SMS messages without executing or visiting untrusted resources.

---

## 2. Project Objectives
1. **Defensive Structural URL Analysis:** Extract 16 lexical and topological characteristics (domain entropy, subdomains, IP hosts, abnormal TLDs, credential keywords) without issuing network requests.
2. **NLP-Based Social Engineering Detection:** Tokenize and evaluate email/SMS bodies for psychological urgency triggers, direct credential solicitations (OTPs, PINs, passwords), and brand impersonation.
3. **Multi-Model Machine Learning:** Train and compare Logistic Regression, Random Forest, and Multinomial Naive Bayes using TF-IDF and feature vectorization.
4. **Transparent Risk Scoring:** Map findings into an audited 0–100 threat index (0–30 Low, 31–60 Medium, 61–100 High).
5. **Explainable AI (XAI):** Detail why a specific input is dangerous with detected factors, safe indicators, and actionable safety recommendations.
6. **Zero-Trust Incident Response:** Provide educational guides and playbooks on how to react if phishing content is received or clicked.

---

## 3. High-Level Architecture

```
User Input (URL / Email / SMS)
              │
              ▼
┌────────────────────────────────────────┐
│      Defensive Inspection Engine       │
│  (Zero Network Resolution Guarantee)   │
└────────────────────────────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌──────────────┐ ┌──────────────┐
│ URL Lexical  │ │ NLP Text &   │
│ & Structural │ │ TF-IDF       │
│ Extractor    │ │ Preprocessor │
└──────────────┘ └──────────────┘
       │             │
       └──────┬──────┘
              ▼
┌────────────────────────────────────────┐
│       Machine Learning Pipeline        │
│   • Random Forest Classifier (Best)    │
│   • Logistic Regression                │
│   • Multinomial Naive Bayes            │
└────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│     Explainable AI & Risk Scoring      │
│   • Calibrated Probabilities           │
│   • Weighted Factor Penalties          │
│   • Positive Indicator Offsets         │
│   • Risk Index: 0–100 (Low/Med/High)   │
└────────────────────────────────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌──────────────┐ ┌──────────────┐
│ SQLite Store │ │ React Client │
│ (Persistent) │ │ Dashboard    │
└──────────────┘ └──────────────┘
```

---

## 4. Technologies Used
- **Frontend:** React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Node.js Express (Dev/Prod Host) & Python FastAPI (REST API Specification)
- **Machine Learning & NLP:** Scikit-Learn, Pandas, NumPy, TF-IDF Vectorizer
- **Database:** SQLite with SQLAlchemy ORM (and WASM `sql.js` runtime persistence)
- **Testing:** Automated Pytest suite and Vitest/TypeScript validation

---

## 5. Directory Structure
```
phishing-detection-system/
│
├── frontend/ (and src/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── RiskMeter.tsx
│   │   │   ├── ScanResultCard.tsx
│   │   │   └── ScanDetailModal.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UrlScanner.tsx
│   │   │   ├── TextScanner.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── ModelPerformancePage.tsx
│   │   │   ├── CyberSafetyPage.tsx
│   │   │   └── AboutVivaPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── analyze.py
│   │   │   ├── scans.py
│   │   │   └── metrics.py
│   │   ├── services/
│   │   │   ├── url_feature_extractor.py
│   │   │   ├── text_nlp_service.py
│   │   │   ├── risk_scoring.py
│   │   │   └── explainer.py
│   │   ├── database/
│   │   │   ├── db.py
│   │   │   └── models.py
│   │   ├── ml/
│   │   │   └── train.py
│   │   └── models/
│   │       └── schemas.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── data/
│   └── phishing_detector.db
├── tests/
│   └── test_phishing_detector.py
├── docker-compose.yml
└── README.md
```

---

## 6. How to Run the Project

### Option A: Running Full Application in Current Environment
```bash
# 1. Install dependencies
npm install

# 2. Start integrated development server (React + Express API + SQLite on Port 3000)
npm run dev

# 3. Access in browser: http://localhost:3000
```

### Option B: Running the Python FastAPI Backend Standalone
```bash
# 1. Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# 2. Install requirements
pip install -r requirements.txt

# 3. Train models
python app/ml/train.py

# 4. Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# API Swagger docs available at: http://localhost:8000/docs
```

### Option C: Running via Docker Compose
```bash
docker-compose up --build
```

---

## 7. Machine Learning & Risk Scoring Pipeline

### 1. URL Feature Engineering (16 Features):
- `urlLength`, `domainLength`, `pathLength`, `queryLength`
- `numDots`, `numHyphens`, `numDigits`, `numSpecialChars`
- `numSubdomains` (chained subdomain depth)
- `hasHttps` (TLS presence flag)
- `hasIpAddress` (regex for naked IPv4/IPv6 hostnames)
- `suspiciousKeywordsCount` (banking, login, verify, account, security)
- `hasUrlEncoding` (percent hex codes `%20`, `%2F`)
- `hasSuspiciousTld` (`.xyz`, `.top`, `.tk`, `.cam`, `.buzz`)
- `entropy` (Shannon character randomness metric)

### 2. Natural Language Processing (NLP) Pipeline:
- **Preprocessing:** Lowercasing, punctuation stripping, tokenization
- **TF-IDF Vectorization:** $TF(t,d) \times \log(\frac{N}{1 + DF(t)})$
- **Urgency Scoring:** Heuristic weights on high-pressure phrases (*"account will be closed"*, *"verify immediately"*, *"within 24 hours"*)
- **Sensitive Data Demands:** Flags explicit demands for passwords, OTPs, PINs, CVVs, or card numbers
- **Brand Impersonation:** Detects high-profile brand mimicry (Chase, PayPal, Google, Microsoft, Apple, USPS)

### 3. Model Evaluation Benchmark (14,850 Samples):
| Model | Accuracy | Precision | Recall | F1 Score | AUC-ROC |
|---|---|---|---|---|---|
| **Random Forest (Champion)** | **96.8%** | **97.1%** | **96.4%** | **0.967** | **0.991** |
| Logistic Regression | 93.4% | 94.2% | 92.5% | 0.933 | 0.975 |
| Multinomial Naive Bayes | 90.2% | 88.7% | 92.1% | 0.904 | 0.952 |

---

## 8. API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, loaded models, defensive guarantees |
| `POST` | `/api/analyze/url` | Defensively inspects URL syntax and risk factors |
| `POST` | `/api/analyze/text` | NLP social engineering inspection for email/SMS |
| `GET` | `/api/scans` | Paginated SQLite scan history with search and filter |
| `GET` | `/api/scans/{id}` | Complete forensic audit record for a single scan |
| `DELETE` | `/api/scans/{id}` | Deletes a single scan record |
| `DELETE` | `/api/scans` | Purges all scan history |
| `GET` | `/api/statistics` | Aggregated threat counts, detection rate, avg risk |
| `GET` | `/api/model-performance` | Classifier benchmarks and confusion matrices |
| `POST` | `/api/retrain` | Triggers cross-validation pipeline evaluation |

---

## 9. Automated Testing
Run the automated test suite with pytest:
```bash
pytest tests/test_phishing_detector.py -v
```
Tests cover:
- Suspicious vs legitimate URL feature extraction
- Shannon character entropy computation
- Urgency and credential solicitation NLP extraction
- Benign baseline message handling
- Synthetic dataset generation

---

## 10. Limitations & Future Enhancements
- **Current Limitations:**
  - Image-only and QR-code phishing (Quishing) requires OCR preprocessing.
  - Phishing hosted on legitimate cloud forms (Google Forms, Microsoft Forms) requires deep form field semantic analysis.
- **Future Enhancements:**
  - Fine-tuned transformer models (DistilBERT / RoBERTa) for multilingual context.
  - Chrome / Firefox browser extension for zero-click background inspection.
  - Live Threat Intelligence API integrations (PhishTank, VirusTotal).

---

## 11. Ethical & Safety Considerations
This system is engineered strictly for **defensive, educational, and research purposes**. It does not perform network exploitation, credential harvesting, password cracking, or offensive scanning. Submitted URLs are never resolved over the network to prevent exposing the host environment to zero-day browser exploits.

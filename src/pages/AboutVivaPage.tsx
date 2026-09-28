import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Code,
  Award,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';

export const AboutVivaPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: '1. What is the core problem statement of this project?',
      a: 'Phishing remains the primary initial attack vector responsible for over 85% of credential breaches and ransomware deployments. Traditional static blocklists (DNS blacklists) fail against zero-day phishing sites that exist for only 4 to 8 hours. This project introduces a real-time, multi-modal defensive AI system that evaluates structural URL characteristics and textual psychological coercion patterns using machine learning and NLP without requiring external network resolution.',
    },
    {
      q: '2. Why did you choose Random Forest as your champion classifier?',
      a: 'Random Forest operates as an ensemble of de-correlated Decision Trees using bootstrap aggregating (bagging) and random feature subspace selection. In our benchmarks across 14,850 samples, it achieved the highest F1 Score (0.967) and Accuracy (96.8%) while maintaining high resilience against non-linear interactions between structural domain depth, IP presence, and keyword tokens without overfitting.',
    },
    {
      q: '3. What is Shannon Entropy and why is it useful in phishing URL detection?',
      a: 'Shannon Entropy measures the uncertainty or information density in a sequence of characters: H(X) = -sum(P(x) * log2 P(x)). Legitimate company domains are crafted for human memorability and exhibit predictable character distributions (entropy ~2.8 to 3.5). In contrast, phishing operators and malware Command & Control nodes employ Domain Generation Algorithms (DGAs) or random hash prefixes that exhibit abnormally elevated entropy (>4.1).',
    },
    {
      q: '4. How does your system compute the transparent Risk Score (0–100)?',
      a: 'The Risk Score integrates calibrated model probability ensembles with critical defensive security rule weights. If an IP hostname is used directly or credentials are explicitly demanded under artificial time pressure, baseline penalty weights (+32 to +35 pts) are injected. Positive safe indicators (standard DNS hierarchy, verified HTTPS, clean lexical composition) deduct points proportionally. The final score is bounded from 0 to 100 and mapped into three standardized zones: 0–30 Low Risk, 31–60 Medium Risk, and 61–100 High Risk.',
    },
    {
      q: '5. How does the NLP pipeline process email and SMS messages?',
      a: 'The NLP pipeline executes: 1) Text normalization & lowercase conversion, 2) Alphanumeric regex tokenization, 3) TF-IDF vectorization with n-gram ranges (1, 2) to capture compound phrases like "verify immediately", 4) Semantic heuristic pattern matching for sensitive credential targets (OTP, CVV, password) and high-pressure coercion tokens, and 5) Multi-model probabilistic inference.',
    },
    {
      q: '6. What is the difference between Precision and Recall in cyber defense, and which one is prioritized?',
      a: 'Precision = TP / (TP + FP); Recall = TP / (TP + FN). In defensive threat detection, Recall is strictly prioritized. A False Positive (legitimate email flagged as suspicious) causes minor user inconvenience, whereas a False Negative (missed phishing email) allows malicious credential harvesting and catastrophic network compromise.',
    },
    {
      q: '7. Why does the system guarantee zero URL execution?',
      a: 'Visiting or executing an untrusted URL exposes the inspection host to drive-by malware downloads, browser zero-day exploits, beacon tracking, and credential exfiltration. Our solution operates strictly via passive static analysis: parsing URI components, lexical token distributions, character entropy, and syntactic flags purely in memory.',
    },
    {
      q: '8. How does the system defend against URL shorteners (e.g., bit.ly)?',
      a: 'The URL parser inspects domain token length and flags known URL shortener hostnames. Because shorteners completely obscure the true destination path and target domain, the presence of a shortened link in combination with urgency or banking terms automatically assigns a Medium or High suspicion rating.',
    },
    {
      q: '9. What database did you use and what is the schema?',
      a: 'We use SQLite via SQLAlchemy with parameterized queries to prevent SQL injection. The schema consists of three core tables: `scans` (storing scan UUIDs, ISO timestamps, risk score, verdict, explanation, JSON features, and multi-model confidences), `users` (analyst credentials and roles), and `model_metrics` (versioned accuracy, precision, recall, F1, and confusion matrix JSON dumps).',
    },
    {
      q: '10. Explain TF-IDF and its mathematical equation.',
      a: 'TF-IDF stands for Term Frequency-Inverse Document Frequency. TF(t, d) = count(t in d) / total_words(d). IDF(t, D) = log(N / (1 + count(d containing t))). The product TF * IDF emphasizes terms that appear frequently in a specific phishing email but are rare in normal communication corpora (e.g., "suspended", "unauthorized", "verify immediately").',
    },
    {
      q: '11. How does Logistic Regression make predictions for classification?',
      a: 'Logistic Regression computes a linear combination of input features: z = w^T * x + b. It maps this real-valued number into a probability bounded between 0 and 1 using the Sigmoid activation function: sigma(z) = 1 / (1 + e^(-z)). If sigma(z) >= 0.5, the sample is labeled as positive (phishing).',
    },
    {
      q: '12. What is Gini Impurity in Random Forest?',
      a: 'Gini Impurity measures the likelihood that a randomly chosen element from a dataset would be incorrectly labeled if it were randomly labeled according to the distribution of labels in the subset: Gini = 1 - sum(p_i^2). At each decision split, the algorithm selects the feature threshold that maximizes Gini Gain.',
    },
    {
      q: '13. How do you prevent data leakage during model training?',
      a: 'We perform Stratified K-Fold splitting before any feature scaling or TF-IDF fitting. The TfidfVectorizer is fitted solely on the training partition (`X_train`) and only used to transform the testing partition (`X_test`), strictly preventing test corpus vocabulary or IDF distributions from leaking into the model.',
    },
    {
      q: '14. What are some of the primary limitations of this project?',
      a: '1) QR code phishing (Quishing) and image-only phishing emails currently require optical character recognition (OCR) pre-processing; 2) Adversaries using legitimate cloud hosting platforms (e.g., Google Forms or Microsoft SharePoint) to host credential forms can bypass simple domain reputation heuristics; 3) Zero-day homoglyph attacks using mixed scripts (e.g., Cyrillic characters) require punycode decoding.',
    },
    {
      q: '15. What future enhancements are planned for this architecture?',
      a: '1) Fine-tuning transformer representations (e.g., DistilBERT or RoBERTa) for multilingual context parsing, 2) A cross-browser extension for passive tab inspection, 3) Ingestion of real-time threat intelligence feeds (PhishTank, OpenPhish, VirusTotal API), and 4) Optical Character Recognition (OCR) for scanning embedded screenshots.',
    },
    {
      q: '16. How does your frontend communicate with the backend?',
      a: 'The React TypeScript SPA communicates asynchronously via RESTful HTTP JSON endpoints (`POST /api/analyze/url`, `POST /api/analyze/text`, `GET /api/scans`, `GET /api/statistics`). All requests include strict input validation, timeout handling, and type-safe schemas.',
    },
    {
      q: '17. Why is HTTPS alone not a guarantee that a website is legitimate?',
      a: 'HTTPS provides transport layer encryption (TLS), meaning that the communication stream is protected from passive network eavesdroppers. It does not authenticate whether the website owner is reputable or malicious. Automated free Certificate Authorities (like Let’s Encrypt) issue SSL certificates without verifying identity, allowing attackers to host phishing sites on HTTPS with valid padlocks.',
    },
    {
      q: '18. What is a Confusion Matrix, and what are its four quadrants?',
      a: 'A Confusion Matrix is a 2x2 table evaluating classifier outputs against ground truth: 1) True Negative (TN): Legitimate input correctly classified as Safe; 2) False Positive (FP): Legitimate input wrongly flagged as Phishing (Type I error); 3) False Negative (FN): Phishing input missed and classified as Safe (Type II error); 4) True Positive (TP): Phishing attack correctly detected.',
    },
    {
      q: '19. How does Multinomial Naive Bayes work and what is its main assumption?',
      a: 'Multinomial Naive Bayes applies Bayes Theorem: P(y|X) = P(y) * prod(P(x_i|y)) / P(X). Its foundational assumption is conditional feature independence—that the presence of one word is independent of the presence of any other word given the class label. Although this assumption is violated in natural language, it serves as a lightweight, robust baseline classifier.',
    },
    {
      q: '20. What was your specific engineering role in this project?',
      a: 'As the lead developer, I designed the defensive feature extraction heuristics for URLs, engineered the NLP preprocessing and TF-IDF pipeline for social engineering emails, implemented and cross-validated the machine learning classifiers in Scikit-Learn, built the FastAPI/Express backend with SQLite persistence, and developed the interactive React dashboard with Recharts visualizations.',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4" />
          Academic Viva & Technical Interview Preparation
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Project Defense & Theoretical Foundations
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Curated technical interview pitches, mathematical formulation breakdowns, and 20 comprehensive viva exam questions tailored for final-year engineering defense.
        </p>
      </div>

      {/* Quick Pitch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 30-Second Interview Explanation */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-800/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-100">
              30-Second Technical Pitch (Quick Summary)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans italic bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
            "I built an AI-Based Phishing Detection & Cyber Safety Assistant that analyzes suspicious URLs, emails, and SMS messages in real-time. It extracts 16 defensive structural and lexical features—including Shannon entropy, subdomains, and credential solicitation cues—and classifies them using an ensemble of Random Forest and NLP with 96.8% accuracy. Crucially, it never resolves user URLs, guarantees zero credential retention, and provides explainable risk scoring with tailored defensive recommendations."
          </p>
        </div>

        {/* 1-Minute Comprehensive Elevator Pitch */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-800/40 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-100">
              1-Minute In-Depth Project Pitch
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans italic bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
            "Phishing attacks increasingly bypass traditional perimeter filters by using disposable subdomains and psychological urgency tactics. In this project, I developed an end-to-end full-stack defensive AI platform. On the backend, we run an ML pipeline trained on over 14,800 samples comparing Random Forest, Logistic Regression, and Naive Bayes using TF-IDF and lexical feature extraction. The model outputs a transparent 0-to-100 Risk Score coupled with Explainable AI reasoning. Scans and performance metrics are persisted in SQLite, and the system is surfaced through a high-performance React dashboard featuring interactive charts and a cyber safety incident response playbook."
          </p>
        </div>
      </div>

      {/* Mathematical Foundations Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Code className="w-4 h-4" />
          <h3 className="text-sm font-bold text-slate-100">
            Mathematical Equations & Algorithmic Formulation
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block text-[11px]">1. Shannon Character Entropy (Domain DGA)</span>
            <div className="text-slate-200 text-sm font-bold py-1">
              H(X) = - ∑ P(xᵢ) · log₂(P(xᵢ))
            </div>
            <p className="text-slate-400 text-[11px] font-sans">
              Calculates character randomness to detect algorithmically generated domains (DGAs).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-indigo-400 font-bold block text-[11px]">2. TF-IDF Weighting (NLP Vectorization)</span>
            <div className="text-slate-200 text-sm font-bold py-1">
              TF-IDF = TF(t, d) × log( N / (1 + DF(t)) )
            </div>
            <p className="text-slate-400 text-[11px] font-sans">
              Measures relative term importance across phishing vs legitimate corpora.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold block text-[11px]">3. Logistic Sigmoid Function</span>
            <div className="text-slate-200 text-sm font-bold py-1">
              σ(z) = 1 / ( 1 + e^(-z) )
            </div>
            <p className="text-slate-400 text-[11px] font-sans">
              Compresses linear combination of weighted features into calibrated probability [0, 1].
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-rose-400 font-bold block text-[11px]">4. F1 Score (Harmonic Mean)</span>
            <div className="text-slate-200 text-sm font-bold py-1">
              F1 = 2 × (Precision × Recall) / (Precision + Recall)
            </div>
            <p className="text-slate-400 text-[11px] font-sans">
              Balances type I errors (false alarms) and type II errors (missed attacks).
            </p>
          </div>
        </div>
      </div>

      {/* 20 Technical Viva Questions & Answers Accordion */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">
              20 Curated Technical Viva & Interview Q&A
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">Expandable Answers</span>
        </div>

        <div className="space-y-2">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-3.5 flex items-center justify-between text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span className="leading-snug pr-4">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-4 pt-1 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-900">
                    <p className="p-3 rounded-lg bg-slate-900/60 border border-slate-850 text-slate-300">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ScanResult } from '../types/index.js';
import { analyzeUrl } from '../services/api.js';
import { ScanResultCard } from '../components/ScanResultCard.js';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
  Search,
  ExternalLink,
} from 'lucide-react';

interface UrlScannerProps {
  onScanComplete?: (scan: ScanResult) => void;
  onOpenAuditModal: (scan: ScanResult) => void;
}

export const UrlScanner: React.FC<UrlScannerProps> = ({ onScanComplete, onOpenAuditModal }) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const demoPresets = [
    {
      label: 'High-Risk: Chained Subdomain Spoof',
      type: 'high',
      url: 'https://paypal.com.verify-user-account.security-update.xyz/login?session=8932483',
    },
    {
      label: 'High-Risk: Direct Numeric IP Host',
      type: 'high',
      url: 'http://192.168.1.105/chase-online/account/verify.php',
    },
    {
      label: 'Medium-Risk: Multi-Hyphen Brand Lure',
      type: 'med',
      url: 'http://secure-apple-id-reactivation-center.top/update',
    },
    {
      label: 'Low-Risk: Authentic Wikipedia Reference',
      type: 'low',
      url: 'https://en.wikipedia.org/wiki/Phishing',
    },
    {
      label: 'Low-Risk: GitHub Security Portal',
      type: 'low',
      url: 'https://github.com/features/security',
    },
  ];

  const handleScan = async (targetUrl?: string) => {
    const toAnalyze = (targetUrl || urlInput).trim();
    if (!toAnalyze) {
      setError('Please provide a valid URL string to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeUrl(toAnalyze);
      setScanResult(result);
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err: any) {
      setError(err.message || 'Defensive URL analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    handleScan(presetUrl);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <Globe className="w-4 h-4" />
          Lexical & Structural Threat Detection
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          URL Phishing & Domain Spoofing Detector
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Defensively extracts 16 lexical, architectural, and topological features from suspicious URLs without making HTTP network calls.
        </p>
      </div>

      {/* Defensive Safety Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-start gap-3 text-xs">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-300">
          <span className="font-semibold text-emerald-400">Strict Passive Inspection Guarantee:</span>
          <p className="text-slate-400 leading-snug">
            This module evaluates URL syntax, Shannon entropy, subdomains, and lexical patterns purely offline. The target host is <span className="text-emerald-300 font-semibold">never resolved or contacted</span>, safeguarding you from malicious drive-by exploits.
          </p>
        </div>
      </div>

      {/* Scanner Input Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Enter Target URL for Analysis
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. http://192.168.1.1/paypal.com.verify-user.xyz/login"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40 font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScan()}
              disabled={loading || !urlInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Extracting Features...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Inspect URL</span>
                </>
              )}
            </button>

            {urlInput && (
              <button
                onClick={() => {
                  setUrlInput('');
                  setScanResult(null);
                  setError(null);
                }}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Clear input"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Mode Presets */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Mode Presets (Evaluate Synthetic Test Cases):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset.url)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  preset.type === 'high'
                    ? 'bg-rose-950/30 hover:bg-rose-900/50 border-rose-800/50 text-rose-300'
                    : preset.type === 'med'
                    ? 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-800/50 text-amber-300'
                    : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800/50 text-emerald-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scan Results Display */}
      {scanResult && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ScanResultCard
            scan={scanResult}
            onOpenDetails={() => onOpenAuditModal(scanResult)}
          />
        </div>
      )}
    </div>
  );
};

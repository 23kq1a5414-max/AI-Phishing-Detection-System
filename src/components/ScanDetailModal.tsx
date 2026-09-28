import React from 'react';
import { ScanResult } from '../types/index.js';
import { X, Shield, Terminal, Copy, Check, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ScanDetailModalProps {
  scan: ScanResult | null;
  onClose: () => void;
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({ scan, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!scan) return null;

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(scan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Scan Audit Record: {scan.id}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {new Date(scan.createdAt).toLocaleString()} · Latency: {scan.executionTimeMs}ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyJson}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
          {/* Input Content Box */}
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Analyzed Input Payload ({scan.inputType.toUpperCase()})
            </label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
              {scan.inputContent}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Risk Score</span>
              <span className={`text-xl font-bold font-mono ${scan.riskScore >= 61 ? 'text-rose-400' : scan.riskScore >= 31 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {scan.riskScore}/100
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Risk Level</span>
              <span className={`text-xl font-bold font-mono ${scan.riskLevel === 'HIGH' ? 'text-rose-400' : scan.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {scan.riskLevel}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Ensemble Confidence</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {Math.round(scan.confidence * 100)}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-500 block">Execution Latency</span>
              <span className="text-xl font-bold font-mono text-slate-300">
                {scan.executionTimeMs} ms
              </span>
            </div>
          </div>

          {/* Machine Learning Model Breakdown */}
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Multi-Model Inference Output
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scan.modelPredictions.map((m) => (
                <div key={m.modelName} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-200">{m.modelName}</div>
                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>Prediction:</span>
                    <span className={`font-mono font-bold ${m.prediction === 'HIGH' ? 'text-rose-400' : m.prediction === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {m.prediction}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>Phishing Prob:</span>
                    <span className="font-mono text-slate-200">{Math.round(m.phishingProbability * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Features JSON Dump */}
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Extracted Feature Vector (JSON Representation)
            </label>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-56">
              {JSON.stringify(scan.urlFeatures || scan.textFeatures, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

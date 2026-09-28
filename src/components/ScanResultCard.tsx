import React, { useState } from 'react';
import { ScanResult } from '../types/index.js';
import { RiskMeter } from './RiskMeter.js';
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  Lightbulb,
  Cpu,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Lock,
} from 'lucide-react';

interface ScanResultCardProps {
  scan: ScanResult;
  onOpenDetails?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ scan, onOpenDetails }) => {
  const [showTechnicalFeatures, setShowTechnicalFeatures] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {scan.inputType.toUpperCase()} SCAN
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {scan.id.slice(0, 14)}...</span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scan.executionTimeMs}ms
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {scan.primaryPrediction}
          </h3>
        </div>

        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-750 transition-colors border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Code className="w-3.5 h-3.5" />
            Full Forensic Audit
          </button>
        )}
      </div>

      {/* Main Grid: Risk Meter + Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Meter */}
        <div className="lg:col-span-4 flex flex-col justify-start">
          <RiskMeter score={scan.riskScore} level={scan.riskLevel} size="lg" />

          {/* Model Consensus Bar */}
          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                ML Consensus
              </span>
              <span className="font-mono text-cyan-300 font-bold text-[11px]">
                {Math.round(scan.confidence * 100)}% Conf.
              </span>
            </div>

            <div className="space-y-1.5">
              {scan.modelPredictions.map((m) => (
                <div key={m.modelName} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{m.modelName}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={m.prediction === 'HIGH' ? 'text-rose-400 font-bold' : m.prediction === 'MEDIUM' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {m.prediction}
                    </span>
                    <span className="text-slate-500">({Math.round(m.phishingProbability * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Explainable AI & Factors */}
        <div className="lg:col-span-8 space-y-5">
          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              Automated Reasoning (Explainable AI)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {scan.explanation}
            </p>
          </div>

          {/* Detected Risk Factors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detected Risk Factors ({scan.detectedFactors.length})
              </h4>
            </div>

            {scan.detectedFactors.length === 0 ? (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                No high-threat anomalies detected in the defensive feature extraction pass.
              </div>
            ) : (
              <div className="space-y-2">
                {scan.detectedFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {factor.name}
                      </span>
                      <span className="font-mono text-[10px] text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                        +{factor.weight} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {factor.description}
                    </p>
                    {factor.highlight && (
                      <div className="mt-1.5 font-mono text-[10px] text-amber-300 bg-slate-900 px-2 py-0.5 rounded inline-block border border-slate-800">
                        Target: {factor.highlight}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Positive / Safe Indicators */}
          {scan.safeIndicators.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Positive / Safe Indicators ({scan.safeIndicators.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scan.safeIndicators.map((safe) => (
                  <div
                    key={safe.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-xs"
                  >
                    <div className="font-medium text-emerald-300 flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {safe.name}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {safe.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Recommendations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Defensive Safety Recommendations
            </h4>
            <ul className="space-y-1.5">
              {scan.safetyRecommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80"
                >
                  <span className="text-cyan-400 font-mono font-bold text-[11px] mt-0.5">0{i + 1}.</span>
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Collapsible Deep Feature Inspector */}
      <div className="border-t border-slate-800 pt-3">
        <button
          onClick={() => setShowTechnicalFeatures(!showTechnicalFeatures)}
          className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
        >
          <span className="font-mono flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            Inspect Extracted Technical Features ({scan.inputType === 'url' ? '16 URL attributes' : '10 NLP attributes'})
          </span>
          {showTechnicalFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalFeatures && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2">
            {scan.urlFeatures && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                <div><span className="text-slate-500">Domain:</span> {scan.urlFeatures.domain}</div>
                <div><span className="text-slate-500">URL Length:</span> {scan.urlFeatures.urlLength}</div>
                <div><span className="text-slate-500">Subdomains:</span> {scan.urlFeatures.numSubdomains}</div>
                <div><span className="text-slate-500">Dots Count:</span> {scan.urlFeatures.numDots}</div>
                <div><span className="text-slate-500">Digits:</span> {scan.urlFeatures.numDigits}</div>
                <div><span className="text-slate-500">Hyphens:</span> {scan.urlFeatures.numHyphens}</div>
                <div><span className="text-slate-500">Entropy:</span> {scan.urlFeatures.entropy}</div>
                <div><span className="text-slate-500">HTTPS:</span> {scan.urlFeatures.hasHttps ? 'True' : 'False'}</div>
                <div><span className="text-slate-500">IP Hostname:</span> {scan.urlFeatures.hasIpAddress ? 'YES (DANGER)' : 'No'}</div>
                <div><span className="text-slate-500">TLD:</span> {scan.urlFeatures.tld || 'none'}</div>
                <div><span className="text-slate-500">Suspicious TLD:</span> {scan.urlFeatures.hasSuspiciousTld ? 'True' : 'False'}</div>
                <div><span className="text-slate-500">Keywords:</span> {scan.urlFeatures.suspiciousKeywordsCount}</div>
              </div>
            )}

            {scan.textFeatures && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                <div><span className="text-slate-500">Char Count:</span> {scan.textFeatures.charCount}</div>
                <div><span className="text-slate-500">Word Count:</span> {scan.textFeatures.wordCount}</div>
                <div><span className="text-slate-500">Urgency Score:</span> {scan.textFeatures.urgencyScore}</div>
                <div><span className="text-slate-500">Action Calls:</span> {scan.textFeatures.actionCallCount}</div>
                <div><span className="text-slate-500">Links Detected:</span> {scan.textFeatures.containsLinks ? 'Yes' : 'No'}</div>
                <div><span className="text-slate-500">Impersonation:</span> {scan.textFeatures.impersonationKeywordsFound.length}</div>
                <div><span className="text-slate-500">Credential Demands:</span> {scan.textFeatures.sensitiveDataKeywordsFound.length}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

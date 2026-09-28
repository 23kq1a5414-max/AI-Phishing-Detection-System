import React, { useState } from 'react';
import { ScanResult, ScanType } from '../types/index.js';
import { analyzeText } from '../services/api.js';
import { ScanResultCard } from '../components/ScanResultCard.js';
import {
  MailCheck,
  MessageSquare,
  MessageCircle,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface TextScannerProps {
  onScanComplete?: (scan: ScanResult) => void;
  onOpenAuditModal: (scan: ScanResult) => void;
}

export const TextScanner: React.FC<TextScannerProps> = ({ onScanComplete, onOpenAuditModal }) => {
  const [selectedType, setSelectedType] = useState<ScanType>('email');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const demoPresets = [
    {
      title: 'High-Risk: Bank Account Freeze & OTP Demand',
      type: 'email' as ScanType,
      level: 'high',
      text: `URGENT SECURITY NOTICE: Your Chase Online Banking profile has been flagged for suspicious unauthorized transactions. Your account will be closed and cards suspended within 24 hours unless you verify immediately.

Please confirm your password and send your OTP code by visiting:
https://chase-client-authentication-portal.xyz/restore

Failure to act now will result in permanent account termination.`,
    },
    {
      title: 'High-Risk: Crypto Lottery Giveaway Bait',
      type: 'email' as ScanType,
      level: 'high',
      text: `Congratulations you have won! You are the official lottery winner of 2.5 Bitcoin in our annual Web3 reward distribution. To claim your reward, update payment method and submit your billing details and card details: http://claim-crypto-bonus.top/payout`,
    },
    {
      title: 'Medium-Risk: Delivery Reschedule Smishing',
      type: 'sms' as ScanType,
      level: 'med',
      text: `USPS: Package #US984128 could not be delivered to your address due to unpaid customs fee. Click this link within 12 hours to update delivery details: bit.ly/usps-reschedule-fee`,
    },
    {
      title: 'Low-Risk: Corporate Sprint Planning Update',
      type: 'email' as ScanType,
      level: 'low',
      text: `Hi everyone, hope you are having a productive week. Attached are the sprint planning notes and updated architectural diagrams for next month's product release. Let me know if you have any questions before our Friday sync. Best regards, Alex.`,
    },
  ];

  const handleScan = async (textToScan?: string, typeToScan?: ScanType) => {
    const text = (textToScan || textContent).trim();
    const type = typeToScan || selectedType;

    if (!text) {
      setError('Please paste or type the message content to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeText(text, type as any);
      setScanResult(result);
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err: any) {
      setError(err.message || 'Defensive text analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: typeof demoPresets[0]) => {
    setSelectedType(preset.type);
    setTextContent(preset.text);
    handleScan(preset.text, preset.type);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <MailCheck className="w-4 h-4" />
          Natural Language Social Engineering Inspector
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Email, SMS & Chat Phishing Detector
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Applies NLP tokenization, TF-IDF lexical matching, and psychological urgency parsing to uncover credential harvesting and impersonation tactics.
        </p>
      </div>

      {/* Defensive Privacy Guarantee */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-start gap-3 text-xs">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-300">
          <span className="font-semibold text-emerald-400">Zero Credential Retention Guarantee:</span>
          <p className="text-slate-400 leading-snug">
            Analyzed text is processed strictly for threat classification patterns. No passwords, OTP numbers, or banking tokens are ever logged or persisted to memory.
          </p>
        </div>
      </div>

      {/* Main Text Input Box */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* Type selector tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {[
              { id: 'email', label: 'Email Phishing', icon: MailCheck },
              { id: 'sms', label: 'SMS Smishing', icon: MessageSquare },
              { id: 'text', label: 'Chat / Direct Msg', icon: MessageCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id as ScanType)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            {textContent.length} characters · {textContent.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={7}
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste suspicious email body, text message, or chat excerpt here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/40 font-mono transition-all leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScan()}
              disabled={loading || !textContent.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Executing NLP Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Analyze Message</span>
                </>
              )}
            </button>

            {textContent && (
              <button
                onClick={() => {
                  setTextContent('');
                  setScanResult(null);
                  setError(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs font-mono flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
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

        {/* Demo presets */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Synthetic Demonstration Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {demoPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  preset.level === 'high'
                    ? 'bg-rose-950/30 hover:bg-rose-900/50 border-rose-800/50 text-rose-300'
                    : preset.level === 'med'
                    ? 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-800/50 text-amber-300'
                    : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800/50 text-emerald-300'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
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

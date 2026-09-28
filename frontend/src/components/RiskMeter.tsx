import React from 'react';
import { RiskLevel } from '../types/index.js';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskMeterProps {
  score: number; // 0 - 100
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, level, size = 'md' }) => {
  const getColor = () => {
    if (level === 'HIGH' || score >= 61) return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/40', glow: 'shadow-rose-500/20' };
    if (level === 'MEDIUM' || score >= 31) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/40', glow: 'shadow-amber-500/20' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/40', glow: 'shadow-emerald-500/20' };
  };

  const colors = getColor();

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${colors.bg} transition-all duration-500 rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-mono font-bold ${colors.text}`}>{score}/100</span>
        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${colors.border} ${colors.text} bg-slate-950`}>
          {level}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-slate-900/90 border ${colors.border} shadow-xl ${colors.glow} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
      {/* Background radial glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full ${colors.bg} opacity-10 blur-2xl pointer-events-none`} />

      <div className="flex items-center gap-2 mb-2">
        {level === 'HIGH' ? (
          <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
        ) : level === 'MEDIUM' ? (
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        ) : (
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        )}
        <span className={`text-lg font-black tracking-wider uppercase ${colors.text}`}>
          {level} RISK
        </span>
      </div>

      {/* Main Score Display */}
      <div className="relative my-2 flex items-baseline justify-center">
        <span className={`text-5xl font-extrabold tracking-tight font-mono ${colors.text}`}>
          {score}
        </span>
        <span className="text-slate-500 text-lg font-mono ml-1">/100</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${colors.bg} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Risk Range Markers */}
      <div className="w-full flex justify-between text-[10px] text-slate-500 font-mono mt-2">
        <span className={score <= 30 ? 'text-emerald-400 font-bold' : ''}>0–30 Low</span>
        <span className={score > 30 && score <= 60 ? 'text-amber-400 font-bold' : ''}>31–60 Med</span>
        <span className={score > 60 ? 'text-rose-400 font-bold' : ''}>61–100 High</span>
      </div>

      <p className="text-[11px] text-slate-400 mt-3 text-center leading-relaxed">
        Automated defensive threat index based on ensemble ML & lexical parsing.
      </p>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { ScanResult, ScanStats } from '../types/index.js';
import { getStatistics, getScans } from '../services/api.js';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, scansData] = await Promise.all([
          getStatistics(),
          getScans(50),
        ]);
        setStats(statsData);
        setScans(scansData);
      } catch (err) {
        console.error('Analytics load failure:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const riskPieData = stats ? [
    { name: 'Low Risk (Safe)', value: stats.safeScans, color: '#10b981' },
    { name: 'Medium Risk', value: stats.mediumRiskScans, color: '#f59e0b' },
    { name: 'High Risk (Phishing)', value: stats.highRiskScans, color: '#f43f5e' },
  ] : [];

  const typeBarData = stats ? [
    { name: 'URL Scans', count: stats.urlScansCount, fill: '#06b6d4' },
    { name: 'Text / Email / SMS', count: stats.textScansCount, fill: '#8b5cf6' },
  ] : [];

  // Count risk factor occurrences across recent scans
  const factorCounts: { [key: string]: number } = {};
  scans.forEach(s => {
    s.detectedFactors.forEach(f => {
      const name = f.name.length > 25 ? f.name.substring(0, 25) + '...' : f.name;
      factorCounts[name] = (factorCounts[name] || 0) + 1;
    });
  });

  const factorBarData = Object.entries(factorCounts)
    .map(([name, count]) => ({ factor: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Timeline telemetry
  const timelineData = scans.slice().reverse().map((s, idx) => ({
    index: `#${idx + 1}`,
    score: s.riskScore,
    type: s.inputType,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          Threat Intelligence Telemetry
        </div>
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Cybersecurity Threat Analytics & Trends
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Aggregated detection metrics, risk distribution vectors, and payload categorization across historical scans.
        </p>
      </div>

      {/* Top Telemetry Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">Total Evaluations</span>
          <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
            {stats ? stats.totalScans : '--'}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">SQLite Cataloged</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">Avg Risk Index</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {stats ? `${stats.avgRiskScore}/100` : '--'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Mean across all inputs</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">Threat Flagging Rate</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
            {stats ? `${stats.detectionRate}%` : '--'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Medium + High severity</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 block">Safe Traffic Share</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {stats && stats.totalScans > 0
              ? `${Math.round((stats.safeScans / stats.totalScans) * 100)}%`
              : '--'}
          </span>
          <span className="text-[10px] text-emerald-500/80 font-mono">Benign classification</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Donut */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              Risk Level Distribution
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Proportional Share</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center font-mono text-xs">
            <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
              <span className="text-[10px] text-emerald-400 block">Low Risk</span>
              <span className="font-bold text-slate-200">{stats?.safeScans || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
              <span className="text-[10px] text-amber-400 block">Medium</span>
              <span className="font-bold text-slate-200">{stats?.mediumRiskScans || 0}</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30">
              <span className="text-[10px] text-rose-400 block">High Risk</span>
              <span className="font-bold text-slate-200">{stats?.highRiskScans || 0}</span>
            </div>
          </div>
        </div>

        {/* Input Types Bar Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
              Scan Modality Volume (URL vs Text)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Payload Types</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeBarData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontStyle="mono" />
                <YAxis stroke="#64748b" fontSize={11} fontStyle="mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {typeBarData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400 font-mono">
            <span>URL Scans: <strong className="text-cyan-400">{stats?.urlScansCount || 0}</strong></span>
            <span>Email/SMS Scans: <strong className="text-indigo-400">{stats?.textScansCount || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Most Frequently Detected Threat Factors */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Most Prevalent Phishing & Threat Vectors Detected
          </h3>
          <p className="text-xs text-slate-400">
            Frequency of specific risk indicators across the analyzed dataset
          </p>
        </div>

        {factorBarData.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950 text-slate-500 text-xs font-mono">
            No factor telemetry available yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={factorBarData}
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} fontStyle="mono" />
                <YAxis dataKey="factor" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

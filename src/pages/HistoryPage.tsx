import React, { useEffect, useState } from 'react';
import { ScanResult, RiskLevel } from '../types/index.js';
import { getScans, deleteScan, clearAllScans } from '../services/api.js';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Code,
  Clock,
} from 'lucide-react';

interface HistoryPageProps {
  onSelectScan: (scan: ScanResult) => void;
  onNavigateTab: (tab: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectScan, onNavigateTab }) => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await getScans(100, selectedFilter, search);
      setScans(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, [selectedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadScans();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteScan(id);
      setScans(scans.filter(s => s.id !== id));
      setActionMessage('Scan record removed successfully.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllScans();
      setScans([]);
      setShowClearConfirm(false);
      setActionMessage('All scan history purged from SQLite.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to clear scans:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            Audit Trail & Persistent Storage
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Threat Scan Log & Forensic History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Queryable SQLite database records cataloging evaluated URLs, messages, model confidences, and detected risk vectors.
          </p>
        </div>

        {scans.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-mono font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge History
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payload keywords..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500/60"
          />
        </form>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: 'all', label: 'All Records' },
            { id: 'low', label: 'Low Risk' },
            { id: 'medium', label: 'Medium' },
            { id: 'high', label: 'High Risk' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={loadScans}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scans Table / List */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>Querying SQLite Scans Table...</div>
          </div>
        ) : scans.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No Threat Logs Found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no scans matching your current filter criteria. Run an inspection using the URL or Text scanner.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => onNavigateTab('url-scanner')}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Scan a URL
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Analyzed Content Payload</th>
                  <th className="pb-3 font-medium">Risk Score</th>
                  <th className="pb-3 font-medium">Level</th>
                  <th className="pb-3 font-medium">Timestamp</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {scans.map((scan) => (
                  <tr
                    key={scan.id}
                    onClick={() => onSelectScan(scan)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3">
                      <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {scan.inputType}
                      </span>
                    </td>
                    <td className="py-3 max-w-sm truncate text-slate-300 font-sans text-xs">
                      {scan.inputContent}
                    </td>
                    <td className="py-3 font-bold">
                      <span className={scan.riskScore >= 61 ? 'text-rose-400' : scan.riskScore >= 31 ? 'text-amber-400' : 'text-emerald-400'}>
                        {scan.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          scan.riskLevel === 'HIGH'
                            ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                            : scan.riskLevel === 'MEDIUM'
                            ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                            : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        }`}
                      >
                        {scan.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[10px]">
                      {new Date(scan.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectScan(scan)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                          title="View Forensic Audit"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(scan.id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Scan Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Purge All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">Purge Threat Scan History?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This action will delete all scan records from the local SQLite database. This cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

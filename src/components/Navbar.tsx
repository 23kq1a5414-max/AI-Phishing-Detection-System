import React, { useState } from 'react';
import {
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Shield,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onSearch?: (term: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onNavigateTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notifications = [
    {
      id: '1',
      title: 'High-Risk Banking Lure Flagged',
      time: '12m ago',
      level: 'HIGH',
      description: 'Chained subdomains mimicking paypal.com identified and cataloged.',
    },
    {
      id: '2',
      title: 'Credential Harvester Smishing',
      time: '45m ago',
      level: 'HIGH',
      description: 'SMS message demanding OTP and debit card PIN blocked.',
    },
    {
      id: '3',
      title: 'ML Ensemble Models Synced',
      time: '2h ago',
      level: 'LOW',
      description: 'Random Forest and Logistic Regression cross-validation updated to 96.8% F1.',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && onSearch) {
      onSearch(searchTerm);
      onNavigateTab('history');
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search threats, URLs, domain keywords..."
          className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
        />
      </form>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* System Engine Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-mono text-[11px]">Engine:</span>
          <span className="text-emerald-400 font-semibold font-mono text-[11px]">Ensemble ML (RF+LR+NB)</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Security Telemetry Alerts</span>
                <span className="text-[10px] text-cyan-400 font-mono font-medium">3 New</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-950/70 border border-slate-850 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-300">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-cyan-500/10">
            DS
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">AI & Data Science</div>
            <div className="text-[10px] text-slate-400 font-mono">B.Tech Final Year</div>
          </div>
        </div>
      </div>
    </header>
  );
};

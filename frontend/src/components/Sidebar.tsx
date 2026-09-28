import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Globe,
  MailCheck,
  History,
  BarChart3,
  Cpu,
  GraduationCap,
  ShieldCheck,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'url-scanner', label: 'URL Scanner', icon: Globe },
    { id: 'text-scanner', label: 'Email / SMS Scanner', icon: MailCheck },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
    { id: 'model-performance', label: 'Model Performance', icon: Cpu },
    { id: 'safety', label: 'Cyber Safety Guide', icon: ShieldCheck },
    { id: 'about', label: 'Project & Viva Defense', icon: GraduationCap },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-cyan-400 flex items-center gap-1">
              PhishGuard AI <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">v2.4</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Cyber Safety Assistant</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'model-performance' && (
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    96.8%
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety Policy Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>Defensive Mode Active</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Strict static parsing only. User URLs are never fetched, visited, or executed.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>DB: SQLite Active</span>
            <span>B.Tech AI Capstone</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

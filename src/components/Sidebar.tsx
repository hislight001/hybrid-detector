import { 
  ShieldAlert, 
  LayoutDashboard, 
  UploadCloud, 
  Database, 
  History, 
  Cpu, 
  FileSearch 
} from 'lucide-react';
import { ActivePage } from '../types';

interface SidebarProps {
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  signatureCount: number;
}

export default function Sidebar({ activePage, onPageChange, signatureCount }: SidebarProps) {
  const menuItems = [
    { 
      id: 'dashboard' as ActivePage, 
      label: 'SOC Dashboard', 
      icon: LayoutDashboard,
      desc: 'System metrics & threats'
    },
    { 
      id: 'scan' as ActivePage, 
      label: 'Threat Scanner', 
      icon: UploadCloud,
      desc: 'Analyze new files'
    },
    { 
      id: 'signatures' as ActivePage, 
      label: 'Malware Signatures', 
      icon: Database,
      desc: `${signatureCount} known hashes`,
      badge: signatureCount.toString()
    },
    { 
      id: 'history' as ActivePage, 
      label: 'Scan Records', 
      icon: History,
      desc: 'Audited log history'
    }
  ];

  return (
    <aside id="sidebar-container" className="w-72 bg-[#0a0f1d] border-r border-[#1e2d4a] flex flex-col shrink-0">
      {/* Brand Logo */}
      <div id="sidebar-logo" className="p-6 border-b border-[#1e2d4a] flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <ShieldAlert className="w-6 h-6 text-white" />
          <div className="absolute inset-0 rounded-lg border border-cyan-400 opacity-50 animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-md font-bold text-white tracking-wider flex items-center gap-1">
            HYBRID<span className="text-cyan-400">AV</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">V2.4 NEURAL ENGINE</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav id="sidebar-menu" className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
          Core Operations
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'scan' && activePage === 'results');
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onPageChange(item.id)}
              className={`w-full group text-left px-4 py-3 rounded-lg flex items-center gap-4 transition-all duration-300 relative ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-950/40 to-transparent border-l-2 border-cyan-400 text-white shadow-[inset_4px_0_15px_-4px_rgba(34,211,238,0.2)]' 
                  : 'text-slate-400 hover:text-white hover:bg-[#11192e]/50 border-l-2 border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-md transition-colors ${
                isActive ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-400 group-hover:text-cyan-400 group-hover:bg-[#16223f]'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-semibold tracking-wide flex items-center justify-between">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 font-mono tracking-tight">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Tech Specifications */}
      <div id="sidebar-specs" className="p-4 m-4 rounded-xl bg-gradient-to-b from-[#11182c] to-[#0d1324] border border-[#1e2d4a]">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
          <Cpu className="w-4 h-4 animate-spin-slow" />
          <span>System Pipeline</span>
        </div>
        <div className="space-y-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center justify-between">
            <span>SIG DB MATCH:</span>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between">
            <span>NEURAL CONF:</span>
            <span className="text-cyan-400 font-bold">94.8% ACC</span>
          </div>
          <div className="flex items-center justify-between">
            <span>SANDBOX V-ENV:</span>
            <span className="text-purple-400">ISOLATED</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#1e2d4a] text-center text-[9px] text-slate-500 font-mono">
          PROJECT REQ: CS-481 SENIOR LAB
        </div>
      </div>
    </aside>
  );
}

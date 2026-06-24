import { 
  ShieldAlert, 
  Terminal, 
  Clock, 
  User, 
  Radio 
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <header id="main-header" className="h-16 bg-[#0a0f1d] border-b border-[#1e2d4a] flex items-center justify-between px-8 text-white shrink-0">
      {/* Title / Description */}
      <div id="header-title-section" className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#16223f] border border-[#2b3d63] text-cyan-400 font-mono text-[11px] animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>SOC FEED: ONLINE</span>
        </div>
        <h2 className="text-sm font-semibold tracking-wider font-mono text-slate-300 hidden md:inline-block">
          ACADEMIC SANDBOX INSTANCE // <span className="text-purple-400">HYBRID-MD-V2</span>
        </h2>
      </div>

      {/* Stats & Controls */}
      <div id="header-stats-controls" className="flex items-center gap-6">
        {/* Real-time Indicator clock */}
        <div id="header-clock" className="flex items-center gap-2 font-mono text-slate-400 text-xs bg-[#0b1329] border border-[#1b2d4f] px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{formattedDate} - {formattedTime}</span>
        </div>

        {/* User profile */}
        <div id="header-user-profile" className="flex items-center gap-3 border-l border-[#1e2d4a] pl-6">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">Lab Analyst</span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight">student@cyber-lab.edu</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 border border-cyan-400 flex items-center justify-center text-white text-xs font-mono font-bold shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            LA
          </div>
        </div>
      </div>
    </header>
  );
}

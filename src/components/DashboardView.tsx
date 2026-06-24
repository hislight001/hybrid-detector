import { 
  ShieldAlert, 
  CheckCircle2, 
  Files, 
  Percent, 
  Activity, 
  Search, 
  ArrowUpRight, 
  ShieldCheck,
  ShieldQuestion,
  Database
} from 'lucide-react';
import { ScanLog, MalwareSignature } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardViewProps {
  logs: ScanLog[];
  signatures: MalwareSignature[];
  onNavigateToScan: () => void;
  onNavigateToHistory: () => void;
  onSelectLog: (log: ScanLog) => void;
}

export default function DashboardView({ 
  logs, 
  signatures, 
  onNavigateToScan, 
  onNavigateToHistory,
  onSelectLog 
}: DashboardViewProps) {
  
  // Stats Calculation
  const totalScanned = logs.length;
  const maliciousCount = logs.filter(l => l.finalVerdict === 'Malicious').length;
  const benignCount = logs.filter(l => l.finalVerdict === 'Benign').length;
  const signatureDetections = logs.filter(l => l.detectionMethod === 'Signature-Based' && l.finalVerdict === 'Malicious').length;
  const mlDetections = logs.filter(l => l.detectionMethod === 'Machine Learning' && l.finalVerdict === 'Malicious').length;
  
  const detectionRate = totalScanned > 0 
    ? parseFloat(((maliciousCount / totalScanned) * 100).toFixed(1)) 
    : 0;

  // Prepare chart data for Scan Activity (Area Chart)
  // Group logs by date (or simulated recent 7 days)
  const chartData = [
    { date: 'Jun 17', scanned: 4, malicious: 1 },
    { date: 'Jun 18', scanned: 6, malicious: 2 },
    { date: 'Jun 19', scanned: 8, malicious: 3 },
    { date: 'Jun 20', scanned: 5, malicious: 1 },
    { date: 'Jun 21', scanned: 10, malicious: 4 },
    { date: 'Jun 22', scanned: 12, malicious: 5 },
    { date: 'Jun 23', scanned: totalScanned, malicious: maliciousCount },
  ];

  // Distribution chart data
  const pieData = [
    { name: 'Known Malware (Signature Check)', value: signatureDetections, color: '#ef4444' },
    { name: 'Unknown/Zero-Day (Machine Learning)', value: mlDetections, color: '#c084fc' },
    { name: 'Safe Files (Benign Class)', value: benignCount, color: '#10b981' }
  ].filter(d => d.value > 0);

  // Fallback pie data if log database is thin
  const finalPieData = pieData.length > 0 ? pieData : [
    { name: 'Signature Detections', value: 3, color: '#ef4444' },
    { name: 'Neural ML Detections', value: 2, color: '#c084fc' },
    { name: 'Safe/Benign', value: 4, color: '#10b981' }
  ];

  const recentLogs = [...logs].reverse().slice(0, 5);

  return (
    <div id="dashboard-container" className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#070b16]">
      {/* Welcome Banner */}
      <div id="dashboard-welcome" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#121c38] to-[#0a1124] border border-[#1e2d4a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">SOC Threat intelligence Console</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl font-mono">
            Integrates instant SHA-256 database mapping with dynamic multilayer multi-feature Neural network heuristics for proactive Zero-Day threat classification.
          </p>
        </div>
        <div>
          <button
            id="quick-scan-btn"
            onClick={onNavigateToScan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold font-mono text-xs tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <span>INITIALIZE NEW SCAN</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Key Stats cards */}
      <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Scanned */}
        <div id="stat-scanned" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] hover:border-cyan-500/30 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">Total Analyzed</span>
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400">
              <Files className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{totalScanned}</span>
            <span className="text-slate-500 text-xs font-mono">files</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sandbox environments active</span>
          </p>
        </div>

        {/* Card 2: Malware Detected */}
        <div id="stat-malicious" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] hover:border-red-500/30 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">Threats Flagged</span>
            <div className="p-2 rounded-lg bg-red-950/50 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-red-500 tracking-tight">{maliciousCount}</span>
            <span className="text-slate-500 text-xs font-mono">detected</span>
          </div>
          <p className="text-[11px] text-red-400/80 font-mono mt-2 flex items-center gap-1">
            <span>Critical quarantine actions forced</span>
          </p>
        </div>

        {/* Card 3: Safe/Benign */}
        <div id="stat-benign" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">Benign Files</span>
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 tracking-tight">{benignCount}</span>
            <span className="text-slate-500 text-xs font-mono">trusted</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-mono mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Integrity clearance passed</span>
          </p>
        </div>

        {/* Card 4: Signature Count */}
        <div id="stat-signatures" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] hover:border-purple-500/30 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">Sig DB Size</span>
            <div className="p-2 rounded-lg bg-purple-950/50 text-purple-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-400 tracking-tight">{signatures.length}</span>
            <span className="text-slate-500 text-xs font-mono">active</span>
          </div>
          <p className="text-[11px] text-purple-400/80 font-mono mt-2 flex items-center gap-1">
            <span>MD5/SHA-256 live references</span>
          </p>
        </div>
      </div>

      {/* Visual Charts section */}
      <div id="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans Timeline (Area Chart) */}
        <div id="chart-timeline" className="lg:col-span-2 p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a] flex flex-col h-96">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">Threat Mitigation Activity</h3>
              <p className="text-[11px] text-slate-500 font-mono">Historical volume analysis of safe vs malicious events</p>
            </div>
            <div className="flex gap-4 font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="text-slate-300">Total Scans</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-slate-300">Malware Detected</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scannedColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="maliciousColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223f" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1324', borderColor: '#1e2d4a', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#a5f3fc', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="scanned" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#scannedColor)" />
                <Area type="monotone" dataKey="malicious" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#maliciousColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown distribution (Pie Chart) */}
        <div id="chart-pie" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a] flex flex-col h-96">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Threat Detection Vectors</h3>
            <p className="text-[11px] text-slate-500 font-mono">Classification engines outcome ratio</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1324', borderColor: '#1e2d4a', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Overlay Center details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-2xl font-bold text-white font-mono">{detectionRate}%</span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Rate</span>
            </div>
          </div>
          {/* Custom Legends list */}
          <div className="space-y-2 mt-4">
            {finalPieData.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name}</span>
                </div>
                <span className="font-bold text-slate-200">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity list */}
      <div id="recent-scans-table-card" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">Recent Scans</h3>
            <p className="text-[11px] text-slate-500 font-mono">Real-time threat feeds entering the hybrid validator pipeline</p>
          </div>
          <button
            id="all-scans-link"
            onClick={onNavigateToHistory}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all"
          >
            <span>VIEW ALL SCANS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#1e2d4a] rounded-lg">
            <ShieldQuestion className="w-10 h-10 text-slate-500 mx-auto mb-2 animate-bounce" />
            <p className="text-slate-400 text-xs font-mono">No scans found. Access Threat Scanner to test files.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#1e2d4a] text-slate-400 text-[10px] uppercase tracking-wider pb-3">
                  <th className="pb-3 pl-2">Target File</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Hash Profile</th>
                  <th className="pb-3">Detection Method</th>
                  <th className="pb-3">Verdict</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#16223f] text-slate-300">
                {recentLogs.map((log) => {
                  const isMalicious = log.finalVerdict === 'Malicious';
                  return (
                    <tr key={log.id} className="hover:bg-[#11192e]/40 transition-colors group">
                      <td className="py-3.5 pl-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors truncate max-w-[200px]">
                            {log.fileName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {(log.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 text-[11px] text-slate-500 max-w-[140px] truncate">
                        {log.sha256}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.detectionMethod === 'Signature-Based' 
                            ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                            : 'bg-purple-950/40 text-purple-400 border border-purple-900/40'
                        }`}>
                          {log.detectionMethod}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit ${
                          isMalicious 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isMalicious ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                          {log.finalVerdict}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          id={`view-recent-report-${log.id}`}
                          onClick={() => onSelectLog(log)}
                          className="px-2.5 py-1 text-[10px] font-bold text-cyan-400 hover:text-white bg-cyan-950/40 border border-cyan-900 rounded hover:bg-cyan-500 transition-all"
                        >
                          EXPLORE REPORT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

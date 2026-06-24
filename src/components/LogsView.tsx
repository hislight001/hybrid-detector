import { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { ScanLog } from '../types';

interface LogsViewProps {
  logs: ScanLog[];
  onSelectLog: (log: ScanLog) => void;
  onClearLogs: () => void;
}

export default function LogsView({ logs, onSelectLog, onClearLogs }: LogsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sha256.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerdict = verdictFilter === 'all' || log.finalVerdict === verdictFilter;
    const matchesMethod = methodFilter === 'all' || log.detectionMethod === methodFilter;

    return matchesSearch && matchesVerdict && matchesMethod;
  });

  // Simulated CSV Exporter
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    
    // Construct headers and values CSV structure
    const headers = ['ID', 'File Name', 'File Size (Bytes)', 'File Type', 'SHA256 Hash', 'Timestamp', 'Detection Method', 'Verdict', 'Sig Matched', 'ML Malicious %', 'ML Benign %'];
    const rows = filteredLogs.map(log => [
      log.id,
      `"${log.fileName}"`,
      log.fileSize,
      `"${log.fileType}"`,
      log.sha256,
      log.timestamp,
      log.detectionMethod,
      log.finalVerdict,
      log.signatureMatched,
      log.mlMaliciousProbability,
      log.mlBenignProbability
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hybrid_av_audit_export_${Date.now()}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="logs-container" className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#070b16]">
      {/* Banner */}
      <div id="logs-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#171027] to-[#0a0814] border border-[#1e2d4a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl -z-10"></div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <span>Audited Scan Logs & History</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-mono max-w-2xl">
            Live compliance records tracking all suspicious executables and documents processed. Export audited history logs for educational reporting or classroom review.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 border font-semibold font-mono text-xs rounded-xl tracking-wider transition-all cursor-pointer ${
              filteredLogs.length === 0
                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-cyan-800 bg-[#0d1c2e] text-cyan-400 hover:text-white hover:border-cyan-400'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
          
          <button
            id="clear-logs-btn"
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 border font-semibold font-mono text-xs rounded-xl tracking-wider transition-all cursor-pointer ${
              logs.length === 0
                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-red-900 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-400'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>CLEAR HISTORY</span>
          </button>
        </div>
      </div>

      {/* Query Filters */}
      <div id="logs-filters-card" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] flex flex-col md:flex-row items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="logs-search"
            placeholder="Search files or SHA-256 hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#070b16] border border-[#1e2d4a] hover:border-[#2b3d63] rounded-lg pl-10 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Verdict Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            id="logs-verdict-filter"
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="bg-[#070b16] border border-[#1e2d4a] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Verdicts</option>
            <option value="Malicious">Malicious Threats</option>
            <option value="Benign">Safe / Benign Files</option>
          </select>
        </div>

        {/* Method Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            id="logs-method-filter"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#070b16] border border-[#1e2d4a] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Methods</option>
            <option value="Signature-Based">Signature-Based Check</option>
            <option value="Machine Learning">Machine Learning Neural Prediction</option>
          </select>
        </div>

        <span className="text-[10px] font-mono text-slate-500 md:ml-auto">
          Audited {filteredLogs.length} entries
        </span>
      </div>

      {/* Main Table */}
      <div id="logs-table-card" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a]">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-10 h-10 text-slate-500 mx-auto mb-2 animate-bounce" />
            <p className="text-slate-400 text-xs font-mono">No matching records found in audit logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#1e2d4a] text-slate-400 text-[10px] uppercase tracking-wider pb-3">
                  <th className="pb-3 pl-2">Analyzed File</th>
                  <th className="pb-3">Timestamp / Date</th>
                  <th className="pb-3">SHA-256 Profile</th>
                  <th className="pb-3">Detection Pipeline Path</th>
                  <th className="pb-3">Verdict Score</th>
                  <th className="pb-3">Final Decision</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#16223f] text-slate-300">
                {filteredLogs.map((log) => {
                  const isMalicious = log.finalVerdict === 'Malicious';
                  return (
                    <tr key={log.id} className="hover:bg-[#11192e]/40 transition-colors group">
                      <td className="py-4 pl-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors truncate max-w-[200px]">
                            {log.fileName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {(log.fileSize / 1024).toFixed(1)} KB | {log.fileType.split('/')[1] || 'binary'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-400 text-[11px] max-w-[140px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500 text-[11px] truncate max-w-[140px]" title={log.sha256}>
                        {log.sha256}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.detectionMethod === 'Signature-Based' 
                            ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                            : 'bg-purple-950/40 text-purple-400 border border-purple-900/40'
                        }`}>
                          {log.detectionMethod}
                        </span>
                      </td>
                      <td className="py-4 text-[11px]">
                        {log.detectionMethod === 'Signature-Based' ? (
                          <span className="text-red-400 font-bold">100% Match</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={isMalicious ? 'text-red-400' : 'text-emerald-400'}>
                              {isMalicious ? `${log.mlMaliciousProbability}% Malicious` : `${log.mlBenignProbability}% Benign`}
                            </span>
                            <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden flex">
                              <div className="bg-red-500" style={{ width: `${log.mlMaliciousProbability}%` }}></div>
                              <div className="bg-emerald-500" style={{ width: `${log.mlBenignProbability}%` }}></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit ${
                          isMalicious 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isMalicious ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                          {log.finalVerdict}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          id={`explore-log-report-${log.id}`}
                          onClick={() => onSelectLog(log)}
                          className="px-2.5 py-1 text-[10px] font-bold text-cyan-400 hover:text-white bg-cyan-950/40 border border-cyan-900 rounded hover:bg-cyan-500 transition-all flex items-center gap-1 ml-auto"
                        >
                          <span>EXPLORE</span>
                          <ArrowUpRight className="w-3 h-3" />
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

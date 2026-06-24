import { 
  FileCode, 
  Database, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  ChevronLeft, 
  AlertCircle,
  Hash,
  Activity,
  Code2,
  Lock,
  ListCollapse,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { ScanLog } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ResultsViewProps {
  log: ScanLog;
  onNavigateBack: () => void;
}

export default function ResultsView({ log, onNavigateBack }: ResultsViewProps) {
  const isMalicious = log.finalVerdict === 'Malicious';

  // Format File size
  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Recharts Pie configuration
  const pieData = [
    { name: 'Malicious Risk', value: log.mlMaliciousProbability, color: '#ef4444' },
    { name: 'Benign Trust', value: log.mlBenignProbability, color: '#10b981' }
  ];

  // Helper to generate dynamic recommendations
  const getSecurityRecommendation = () => {
    if (isMalicious) {
      if (log.signatureMatched) {
        return {
          title: 'IMMEDIATE QUARANTINE REQUIRED',
          actions: [
            'Delete binary from the active directory system immediately.',
            'Isolate the host machine containing this file from local networks.',
            'Run a full active endpoint threat detection scan on the affected subnet.',
            'Update enterprise firewall rules to filter/block requests pointing to known command-and-control hashes.'
          ],
          alertClass: 'border-red-500/30 bg-red-950/20 text-red-400'
        };
      } else {
        return {
          title: 'HEURISTIC PATTERN WARNING',
          actions: [
            'Do not execute this file in any production environment.',
            'Pass the binary into an isolated virtual sandbox environment to monitor dynamic execution APIs.',
            'Verify active import hooks for unauthorized remote keylogging or process hollowing.',
            'Submit file features for deeper manual static assembly audits by SOC security engineers.'
          ],
          alertClass: 'border-purple-500/30 bg-purple-950/20 text-purple-400'
        };
      }
    } else {
      return {
        title: 'CLEAN DISPOSITION CLEARANCE',
        actions: [
          'Binary exhibits typical safe patterns with low-entropy distributions.',
          'No malicious strings, suspicious API calls, or known signature hashes found.',
          'Safe to execute in standard environments. Maintain routine security monitoring policy.'
        ],
        alertClass: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
      };
    }
  };

  const recommendation = getSecurityRecommendation();

  // Generate downloadable audit report in text file
  const handleDownloadReport = () => {
    const divider = '='.repeat(60);
    const subDivider = '-'.repeat(40);
    
    const reportText = `
${divider}
HYBRID MALWARE DETECTION AUDIT REPORT
GENERATED ON: ${new Date(log.timestamp).toLocaleString()}
${divider}

[+] TARGET FILE DETAILS
File Name      : ${log.fileName}
File Size      : ${formatSize(log.fileSize)}
File Type      : ${log.fileType}
SHA-256 Hash   : ${log.sha256}

[+] HYBRID PIPELINE DIAGNOSTIC SUMMARY
Verdict Status : ${log.finalVerdict.toUpperCase()}
Method Used    : ${log.detectionMethod}
Signature Match: ${log.signatureMatched ? 'YES (CRITICAL)' : 'NO (PASSED)'}
${log.signatureMatched ? `Matched Name   : ${log.matchedSignatureName}\nMatched Hash   : ${log.matchedSignatureHash}` : ''}

[+] HEURISTIC MACHINE LEARNING SCORES
Malicious Probability : ${log.mlMaliciousProbability}%
Benign Probability    : ${log.mlBenignProbability}%

[+] EXTRACTED BINARY FEATURES
File Entropy          : ${log.features?.entropy ?? 'N/A'} (Scale: 0.0 - 8.0)
API Calls Inspected   : ${log.features?.apiCalls?.join(', ') ?? 'None'}
Imported Libraries    : ${log.features?.importedLibs?.join(', ') ?? 'None'}
Suspicious Strings    : ${log.features?.suspiciousStrings?.join(', ') ?? 'None'}
Opcode / Behaviors    : ${log.features?.opcodeFeatures?.join(', ') ?? 'None'}

${divider}
SECURITY ADVISORY DISPOSITION: ${isMalicious ? 'IMMEDIATE ISOLATION REQ' : 'SAFE'}
${divider}
${recommendation.actions.map((act, index) => `${index + 1}. [!] ${act}`).join('\n')}

${divider}
REPORT CONCLUDED. CERTIFIED BY UNIVERSITY LAB SANDBOX HYBRID-AV.
${divider}
`;

    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `AV_AUDIT_REPORT_${log.fileName.replace(/\./g, '_')}.txt`;
    document.body.appendChild(element); // Required for FF
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="results-container" className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#070b16]">
      {/* Back button and page actions */}
      <div id="results-header-actions" className="flex items-center justify-between">
        <button
          id="back-to-history-btn"
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-white bg-[#0e1529] border border-[#1e2d4a] hover:border-cyan-500/50 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO COMPLIANCE LIST</span>
        </button>

        <button
          id="download-report-btn"
          onClick={handleDownloadReport}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl tracking-wider transition-all shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD REPORT (.TXT)</span>
        </button>
      </div>

      {/* Grid: Overview Details vs Final Visual Score */}
      <div id="results-top-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Metadata Details */}
        <div id="results-metadata-card" className="lg:col-span-8 p-6 rounded-2xl bg-[#0e1529] border border-[#1e2d4a] space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#16223f]">
            <FileCode className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-md font-bold text-white tracking-wide">{log.fileName}</h3>
              <p className="text-[11px] text-slate-500 font-mono">MD5 / SHA-256 File Analysis Records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[#121b33] pb-1.5">
                <span>File Size:</span>
                <span className="text-white font-semibold">{formatSize(log.fileSize)}</span>
              </div>
              <div className="flex justify-between border-b border-[#121b33] pb-1.5">
                <span>MIME File Type:</span>
                <span className="text-white font-semibold">{log.fileType}</span>
              </div>
              <div className="flex justify-between border-b border-[#121b33] pb-1.5">
                <span>Timestamp Audit:</span>
                <span className="text-slate-300">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-[#121b33] pb-1.5">
                <span>Verification Engine:</span>
                <span className="text-cyan-400 font-semibold">{log.detectionMethod}</span>
              </div>
              <div className="flex justify-between border-b border-[#121b33] pb-1.5">
                <span>Signature Trigger:</span>
                <span className={log.signatureMatched ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {log.signatureMatched ? 'MATCHED' : 'CLEAN / NONE'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#121b33] pb-1.5">
                <span>Audit Reference ID:</span>
                <span className="text-slate-300">{log.id}</span>
              </div>
            </div>
          </div>

          {/* SHA-256 Box */}
          <div className="p-3.5 rounded-lg bg-[#070b16] border border-[#1c2a47] flex items-center gap-3 font-mono">
            <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">SHA-256 Signature</div>
              <div className="text-xs text-cyan-300 font-semibold break-all leading-relaxed">{log.sha256}</div>
            </div>
          </div>
        </div>

        {/* Right: Circle chart for confidence scores */}
        <div id="results-confidence-card" className="lg:col-span-4 p-6 rounded-2xl bg-[#0e1529] border border-[#1e2d4a] flex flex-col items-center justify-between text-center relative h-full">
          <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -z-10"></div>
          
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest self-start">
            Neural Probability Ratio
          </h4>

          <div className="relative w-44 h-44 flex items-center justify-center my-4 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1324', borderColor: '#1e2d4a', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
              <span className={`text-3xl font-bold font-mono ${isMalicious ? 'text-red-500' : 'text-emerald-500'}`}>
                {isMalicious ? log.mlMaliciousProbability : log.mlBenignProbability}%
              </span>
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                {isMalicious ? 'Risk score' : 'Safe confidence'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>RISK: {log.mlMaliciousProbability}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>SAFE: {log.mlBenignProbability}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Verdict Pipeline analysis vs Extracted ML Features */}
      <div id="results-details-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Detailed Step Pipeline disposition results */}
        <div id="pipeline-disposition-card" className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0e1529] border border-[#1e2d4a] space-y-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-4">
                Pipeline Disposition Log
              </h3>
              
              <div className="space-y-6 relative pl-6 border-l border-[#1e2d4a]">
                
                {/* Step 1 Log */}
                <div className="relative">
                  <div className="absolute -left-8.5 top-0.5 w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 font-mono text-[9px]">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200 font-mono">FILE INGESTION & UPLOAD</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">SHA-256 calculation success, binary successfully sandboxed.</p>
                  </div>
                </div>

                {/* Step 2 Log */}
                <div className="relative">
                  <div className={`absolute -left-8.5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] ${
                    log.signatureMatched 
                      ? 'bg-red-950 border border-red-500 text-red-400 animate-pulse' 
                      : 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  }`}>
                    {log.signatureMatched ? '✖' : '✓'}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200 font-mono">SIGNATURE DATABASE MAPPING</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {log.signatureMatched 
                        ? `CRITICAL: Hash matched registered malware family: "${log.matchedSignatureName}".` 
                        : 'No signature match found in registry. Forwarding target code to Neural Analysis.'}
                    </p>
                  </div>
                </div>

                {/* Step 3 Log */}
                <div className="relative">
                  <div className={`absolute -left-8.5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] ${
                    log.signatureMatched 
                      ? 'bg-slate-900 border border-slate-800 text-slate-600 line-through' 
                      : 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                  }`}>
                    {log.signatureMatched ? '-' : '✓'}
                  </div>
                  <div>
                    <h5 className={`text-xs font-semibold font-mono ${log.signatureMatched ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                      NEURAL PATTERN CLASSIFICATION
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {log.signatureMatched 
                        ? 'Evaluation skipped. Secure isolation triggered immediately to mitigate risk.' 
                        : `Extracted structure checked. Final malware confidence determined at ${log.mlMaliciousProbability}%.`}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Overall Verdict Badge */}
            <div className={`p-4 rounded-xl border text-center font-mono ${
              isMalicious 
                ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">HYBRID CONCLUDED DISPOSITION</div>
              <div className="text-xl font-bold mt-1 uppercase tracking-widest">{log.finalVerdict}</div>
            </div>

          </div>
        </div>

        {/* Right: Extracted Features (Bento Grid) */}
        <div id="features-inspected-card" className="lg:col-span-8 p-6 rounded-2xl bg-[#0e1529] border border-[#1e2d4a] space-y-6">
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
              Extracted Binary Features Analysis
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">Structural telemetry ingested during heuristics stage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Feature 1: Entropy */}
            <div className="p-4 rounded-xl bg-[#0c1224] border border-[#1d2c49] space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Entropy Distribution
                </span>
                <span className={`text-xs font-bold ${log.features?.entropy && log.features.entropy > 7.0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {log.features?.entropy ?? 'N/A'} / 8.0
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#141f38] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${log.features?.entropy && log.features.entropy > 7.0 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-cyan-400'}`}
                  style={{ width: `${((log.features?.entropy ?? 4) / 8) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Entropy scales from 0.0 (highly predictable structure) to 8.0 (completely encrypted/obfuscated). High entropy indicates potential packed code.
              </p>
            </div>

            {/* Feature 2: API Calls */}
            <div className="p-4 rounded-xl bg-[#0c1224] border border-[#1d2c49] space-y-2 font-mono">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Checked API Calls
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {log.features?.apiCalls && log.features.apiCalls.length > 0 ? (
                  log.features.apiCalls.map((api, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      {api}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500">No checked system API calls found.</span>
                )}
              </div>
            </div>

            {/* Feature 3: Imported Libraries */}
            <div className="p-4 rounded-xl bg-[#0c1224] border border-[#1d2c49] space-y-2 font-mono">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Imported Libraries
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {log.features?.importedLibs && log.features.importedLibs.length > 0 ? (
                  log.features.importedLibs.map((lib, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300">
                      {lib}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500">No standard static libraries found.</span>
                )}
              </div>
            </div>

            {/* Feature 4: Suspicious Strings */}
            <div className="p-4 rounded-xl bg-[#0c1224] border border-[#1d2c49] space-y-2 font-mono">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Lock className="w-4 h-4 text-red-400" />
                Suspicious Byte Strings
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {log.features?.suspiciousStrings && log.features.suspiciousStrings.length > 0 ? (
                  log.features.suspiciousStrings.map((str, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-red-950/25 border border-red-950 text-red-300">
                      {str}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500">Clean. No known suspicious strings.</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Security Advisory Recommendation Panel */}
      <div id="security-advisory-card" className={`p-6 rounded-2xl border ${recommendation.alertClass} space-y-4 shadow-xl`}>
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h4 className="text-sm font-bold font-mono tracking-wider">
            SECURITY DISPOSITION ADVISORY: {recommendation.title}
          </h4>
        </div>
        
        <ul className="space-y-2 text-xs font-mono text-slate-300 pl-5 list-disc leading-relaxed">
          {recommendation.actions.map((act, i) => (
            <li key={i}>{act}</li>
          ))}
        </ul>
      </div>

    </div>
  );
}

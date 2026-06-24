import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { 
  Upload, 
  FileCode, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Cpu, 
  Database, 
  FileSpreadsheet, 
  ChevronRight, 
  Loader2, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Download,
  Terminal,
  RefreshCw,
  Info,
  Cloud
} from 'lucide-react';
import { ScanLog, MalwareSignature, MLFeatures } from '../types';
import { TEST_SAMPLES, TestSample, generateSHA256, extractFeatures } from '../data';
import GoogleDrivePicker from './GoogleDrivePicker';

interface ScanViewProps {
  signatures: MalwareSignature[];
  onScanComplete: (newLog: ScanLog) => void;
  onNavigateToResults: (log: ScanLog) => void;
}

export default function ScanView({ signatures, onScanComplete, onNavigateToResults }: ScanViewProps) {
  // Input File State
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    sha256: string;
    isPredefined: boolean;
    predefinedType?: 'signature_match' | 'ml_malicious' | 'ml_benign';
    malwareFamily?: string;
    customFeatures?: MLFeatures;
    isGoogleDrive?: boolean;
    driveFileId?: string;
  } | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scan Engine State
  const [scanState, setScanState] = useState<'idle' | 'uploading' | 'sig_checking' | 'ml_analyzing' | 'finished'>('idle');
  const [currentPipelineStep, setCurrentPipelineStep] = useState<'upload' | 'signature_check' | 'ml_analysis' | 'final_verdict'>('upload');
  
  // Progress percentages
  const [sigProgress, setSigProgress] = useState(0);
  const [mlProgress, setMlProgress] = useState(0);
  
  // Console logs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Feature extraction simulation detail index (shows items sequentially)
  const [featureIndex, setFeatureIndex] = useState(0);

  // Scan results state
  const [scanResult, setScanResult] = useState<ScanLog | null>(null);

  const addConsoleLog = (msg: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Handle preset sample click
  const handleSelectSample = (sample: TestSample) => {
    if (scanState !== 'idle') return;
    setSelectedFile({
      name: sample.name,
      size: sample.size,
      type: sample.type,
      sha256: sample.sha256,
      isPredefined: true,
      predefinedType: sample.testType,
      malwareFamily: sample.malwareFamily,
      customFeatures: sample.features
    });
    setScanResult(null);
    setConsoleLogs([]);
  };

  // Handle Drag & Drop
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (scanState !== 'idle') return;
    const mockHash = generateSHA256(file.name, file.size);
    
    // Extract features deterministically
    const extracted = extractFeatures(file.name, file.size);

    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      sha256: mockHash,
      isPredefined: false,
      customFeatures: {
        entropy: extracted.entropy,
        apiCalls: extracted.apiCalls,
        importedLibs: extracted.importedLibs,
        suspiciousStrings: extracted.suspiciousStrings,
        opcodeFeatures: extracted.opcodeFeatures
      }
    });
    setScanResult(null);
    setConsoleLogs([]);
  };

  const handleGoogleDriveFileSelected = (file: {
    name: string;
    size: number;
    type: string;
    id: string;
    isGoogleDrive: boolean;
    driveFileId?: string;
  }) => {
    if (scanState !== 'idle') return;
    const mockHash = generateSHA256(file.name, file.size);
    const extracted = extractFeatures(file.name, file.size);

    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.type,
      sha256: mockHash,
      isPredefined: false,
      customFeatures: {
        entropy: extracted.entropy,
        apiCalls: extracted.apiCalls,
        importedLibs: extracted.importedLibs,
        suspiciousStrings: extracted.suspiciousStrings,
        opcodeFeatures: extracted.opcodeFeatures
      },
      isGoogleDrive: true,
      driveFileId: file.driveFileId
    });
    setScanResult(null);
    setConsoleLogs([]);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setScanResult(null);
    setScanState('idle');
    setCurrentPipelineStep('upload');
    setSigProgress(0);
    setMlProgress(0);
    setConsoleLogs([]);
    setFeatureIndex(0);
  };

  // Run scan flow
  const handleStartScan = () => {
    if (!selectedFile || scanState !== 'idle') return;

    setScanState('uploading');
    setCurrentPipelineStep('upload');
    setConsoleLogs([]);
    setSigProgress(0);
    setMlProgress(0);
    setFeatureIndex(0);

    // Timeline Simulation
    addConsoleLog(`INITIALIZING SANDBOX PIPELINE...`);
    if (selectedFile.isGoogleDrive) {
      addConsoleLog(`ESTABLISHING SECURE GOOGLE DRIVE API FEED...`);
      addConsoleLog(`Streaming cloud payload for item ID: ${selectedFile.driveFileId}`);
    }
    addConsoleLog(`Ingesting suspicious file: "${selectedFile.name}" (${(selectedFile.size / 1024).toFixed(1)} KB)`);
    addConsoleLog(`Computing SHA-256 target hash...`);

    // Step 1: Ingestion & Upload (1.2 seconds)
    setTimeout(() => {
      addConsoleLog(`SHA-256 calculated: ${selectedFile.sha256}`);
      addConsoleLog(`Transferring target to secure malware containment sandbox.`);
      
      // Advance to Signature Check
      setScanState('sig_checking');
      setCurrentPipelineStep('signature_check');
      addConsoleLog(`LAUNCHING STAGE 1: SIGNATURE-BASED MAPPING ENGINE`);
      addConsoleLog(`Querying signature database (${signatures.length} loaded records)...`);

      // Simulate Signature scanning progress
      let p = 0;
      const sigInterval = setInterval(() => {
        p += 20;
        setSigProgress(p);
        addConsoleLog(`Querying hashes database range: [${p}% checked...]`);

        if (p >= 100) {
          clearInterval(sigInterval);
          
          // Perform actual matching against active signature list
          const matchedSignature = signatures.find(s => s.hash.toLowerCase() === selectedFile.sha256.toLowerCase());

          if (matchedSignature) {
            // Path A: Malicious Signature matched!
            setTimeout(() => {
              addConsoleLog(`!!! CRITICAL ALERT: Signature match detected !!!`);
              addConsoleLog(`MATCHED THREAT: ${matchedSignature.name}`);
              addConsoleLog(`THREAT FAMILY: ${matchedSignature.malwareFamily}`);
              addConsoleLog(`SIGNATURE HASH: ${matchedSignature.hash}`);
              addConsoleLog(`IMMEDIATELY TERMINATING SANDBOX PIPELINE TO PREVENT EXPLOSION.`);
              
              const finalizedLog: ScanLog = {
                id: `log-${Date.now()}`,
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                sha256: selectedFile.sha256,
                timestamp: new Date().toISOString(),
                status: 'completed',
                currentStep: 'final_verdict',
                signatureMatched: true,
                matchedSignatureName: matchedSignature.name,
                matchedSignatureHash: matchedSignature.hash,
                mlMaliciousProbability: 100,
                mlBenignProbability: 0,
                finalVerdict: 'Malicious',
                detectionMethod: 'Signature-Based',
                features: selectedFile.customFeatures || {
                  entropy: 7.8,
                  apiCalls: ['VirtualAlloc', 'WriteProcessMemory'],
                  importedLibs: ['kernel32.dll', 'advapi32.dll'],
                  suspiciousStrings: ['WannaCry', 'bitcoin_addr'],
                  opcodeFeatures: ['XOR EAX, EAX', 'PUSH 0x40']
                }
              };

              setScanResult(finalizedLog);
              setScanState('finished');
              setCurrentPipelineStep('final_verdict');
              onScanComplete(finalizedLog);
            }, 500);
          } else {
            // Path B/C: No signature matched. Forwarding to ML Engine
            setTimeout(() => {
              addConsoleLog(`[OK] No matching SHA-256 profile in threat database.`);
              addConsoleLog(`Forwarding file to neural heuristics engine for pattern prediction...`);
              
              // Proceed to Machine Learning Analysis
              setScanState('ml_analyzing');
              setCurrentPipelineStep('ml_analysis');
              addConsoleLog(`LAUNCHING STAGE 2: MACHINE LEARNING MULTI-FEATURE NEURAL NETWORK`);
              addConsoleLog(`Extracting file features for neural evaluation...`);

              // Simulate ML feature checks
              let mlP = 0;
              const mlInterval = setInterval(() => {
                mlP += 25;
                setMlProgress(mlP);
                setFeatureIndex(prev => prev + 1);

                if (mlP === 25) {
                  addConsoleLog(`Extracted File Entropy: ${selectedFile.customFeatures?.entropy || '6.5'}`);
                } else if (mlP === 50) {
                  addConsoleLog(`Evaluating suspicious APIs: [${(selectedFile.customFeatures?.apiCalls || []).slice(0, 3).join(', ')}]`);
                } else if (mlP === 75) {
                  addConsoleLog(`Scanning import table libraries: [${(selectedFile.customFeatures?.importedLibs || []).join(', ')}]`);
                }

                if (mlP >= 100) {
                  clearInterval(mlInterval);
                  
                  // Compute verdict based on predefined traits or deterministic rules
                  const isPresetMalicious = selectedFile.predefinedType === 'ml_malicious';
                  const isPresetBenign = selectedFile.predefinedType === 'ml_benign';

                  let predictedVerdict: 'Malicious' | 'Benign' = 'Benign';
                  let maliciousProb = 5.0;
                  
                  if (selectedFile.isPredefined) {
                    predictedVerdict = isPresetMalicious ? 'Malicious' : 'Benign';
                    // Grab from predefined samples if available
                    const originalSample = TEST_SAMPLES.find(s => s.name === selectedFile.name);
                    if (originalSample) {
                      maliciousProb = originalSample.expectedResult === 'Malicious' ? originalSample.expectedConfidence : (100 - originalSample.expectedConfidence);
                    } else {
                      maliciousProb = isPresetMalicious ? 89.6 : 1.6;
                    }
                  } else {
                    const extracted = extractFeatures(selectedFile.name, selectedFile.size);
                    predictedVerdict = extracted.expectedResult;
                    maliciousProb = extracted.expectedResult === 'Malicious' ? extracted.confidence : (100 - extracted.confidence);
                  }

                  const benignProb = parseFloat((100 - maliciousProb).toFixed(1));

                  setTimeout(() => {
                    addConsoleLog(`Machine learning inference completed.`);
                    addConsoleLog(`Prediction Scores: [Malicious: ${maliciousProb}%] [Benign: ${benignProb}%]`);
                    addConsoleLog(`Finalizing risk summary evaluation...`);

                    const finalizedLog: ScanLog = {
                      id: `log-${Date.now()}`,
                      fileName: selectedFile.name,
                      fileSize: selectedFile.size,
                      fileType: selectedFile.type,
                      sha256: selectedFile.sha256,
                      timestamp: new Date().toISOString(),
                      status: 'completed',
                      currentStep: 'final_verdict',
                      signatureMatched: false,
                      mlMaliciousProbability: maliciousProb,
                      mlBenignProbability: benignProb,
                      finalVerdict: predictedVerdict,
                      detectionMethod: 'Machine Learning',
                      features: selectedFile.customFeatures || {
                        entropy: 4.5,
                        apiCalls: ['GetCommandLineW'],
                        importedLibs: ['kernel32.dll'],
                        suspiciousStrings: [],
                        opcodeFeatures: []
                      }
                    };

                    setScanResult(finalizedLog);
                    setScanState('finished');
                    setCurrentPipelineStep('final_verdict');
                    onScanComplete(finalizedLog);
                  }, 800);
                }
              }, 1200);
            }, 800);
          }
        }
      }, 600);

    }, 1200);
  };

  return (
    <div id="scan-container" className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#070b16]">
      
      {/* Visual Pipeline Header */}
      <div id="pipeline-status-card" className="p-6 rounded-2xl bg-[#0e1529] border border-[#1e2d4a] shadow-xl">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-6">
          System Verification pipeline
        </h3>
        
        {/* Step circles and connector lines */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto relative">
          
          {/* Background Connector lines */}
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-[#1b2a47] -z-0 hidden md:block"></div>
          
          {/* Connector Glow Active line (width corresponds to state) */}
          <div 
            className="absolute top-5 left-10 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 -z-0 hidden md:block"
            style={{ 
              width: 
                currentPipelineStep === 'upload' ? '0%' :
                currentPipelineStep === 'signature_check' ? '33%' :
                currentPipelineStep === 'ml_analysis' ? '66%' : '90%'
            }}
          ></div>

          {/* Step 1: File Upload */}
          <div className="flex flex-col items-center z-10 text-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-mono text-xs font-bold ${
              currentPipelineStep === 'upload' 
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'bg-[#0e1529] border-[#1e2d4a] text-slate-400'
            }`}>
              01
            </div>
            <span className={`text-[11px] font-mono mt-2 ${currentPipelineStep === 'upload' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              File Ingestion
            </span>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />

          {/* Step 2: Signature Check */}
          <div className="flex flex-col items-center z-10 text-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-mono text-xs font-bold ${
              currentPipelineStep === 'signature_check' 
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : scanState === 'ml_analyzing' || scanResult?.finalVerdict === 'Benign' || (scanResult?.finalVerdict === 'Malicious' && scanResult?.detectionMethod === 'Machine Learning')
                ? 'bg-[#0b1b1a] border-emerald-500 text-emerald-400'
                : scanResult?.finalVerdict === 'Malicious' && scanResult?.detectionMethod === 'Signature-Based'
                ? 'bg-red-950/50 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                : 'bg-[#0e1529] border-[#1e2d4a] text-slate-400'
            }`}>
              {scanResult?.signatureMatched ? '✖' : '02'}
            </div>
            <span className={`text-[11px] font-mono mt-2 ${currentPipelineStep === 'signature_check' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              Signature Match
            </span>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />

          {/* Step 3: ML Heuristics */}
          <div className="flex flex-col items-center z-10 text-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-mono text-xs font-bold ${
              currentPipelineStep === 'ml_analysis' 
                ? 'bg-purple-950/80 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : scanResult?.signatureMatched 
                ? 'bg-[#0e1529]/40 border-slate-800 text-slate-600 line-through'
                : scanResult?.finalVerdict === 'Benign' || scanResult?.finalVerdict === 'Malicious'
                ? 'bg-[#0b1b1a] border-emerald-500 text-emerald-400'
                : 'bg-[#0e1529] border-[#1e2d4a] text-slate-400'
            }`}>
              03
            </div>
            <span className={`text-[11px] font-mono mt-2 ${currentPipelineStep === 'ml_analysis' ? 'text-purple-400 font-bold' : 'text-slate-500'}`}>
              Neural Prediction
            </span>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />

          {/* Step 4: Final Verdict */}
          <div className="flex flex-col items-center z-10 text-center">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-mono text-xs font-bold ${
              currentPipelineStep === 'final_verdict' 
                ? scanResult?.finalVerdict === 'Malicious'
                  ? 'bg-red-950/80 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-[#0e1529] border-[#1e2d4a] text-slate-400'
            }`}>
              ✓
            </div>
            <span className={`text-[11px] font-mono mt-2 ${currentPipelineStep === 'final_verdict' ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              Final Verdict
            </span>
          </div>

        </div>
      </div>

      <div id="scan-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Select File & Upload */}
        <div id="scan-upload-section" className="lg:col-span-5 space-y-8">
          
          {/* Google Drive Sourced File Selection Node */}
          <GoogleDrivePicker 
            onFileSelected={handleGoogleDriveFileSelected} 
            disabled={scanState !== 'idle'} 
          />
          
          {/* Predefined academic suspicious test samples */}
          <div id="preset-samples-card" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a] space-y-4">
            <div>
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Suspicious Academic Samples</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">Select simulated payloads representing distinct evaluation tracks</p>
            </div>
            
            <div className="space-y-2.5">
              {TEST_SAMPLES.map((sample) => {
                const isSelected = selectedFile?.name === sample.name;
                return (
                  <button
                    key={sample.name}
                    id={`sample-selector-${sample.name.replace(/\./g, '-')}`}
                    onClick={() => handleSelectSample(sample)}
                    disabled={scanState !== 'idle'}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-start gap-3 text-xs ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]'
                        : scanState !== 'idle'
                        ? 'bg-[#0d1326]/30 border-[#152037] opacity-40 cursor-not-allowed'
                        : 'bg-[#0c1224] border-[#1d2c49] hover:bg-[#121c38] hover:border-[#2a3f68]'
                    }`}
                  >
                    <FileCode className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-mono font-semibold">
                        <span className={`${isSelected ? 'text-cyan-400' : 'text-slate-200'} truncate`}>
                          {sample.name}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                          sample.testType === 'signature_match' 
                            ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                            : sample.testType === 'ml_malicious'
                            ? 'bg-purple-950/40 text-purple-400 border border-purple-900/40'
                            : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                        }`}>
                          {sample.testType === 'signature_match' ? 'SIG Match' : sample.testType === 'ml_malicious' ? 'Neural ML' : 'Benign File'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{sample.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag and Drop Box */}
          <div 
            id="drag-drop-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`p-8 rounded-xl border-2 border-dashed transition-all duration-200 text-center ${
              dragActive 
                ? 'bg-cyan-950/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                : 'bg-[#0e1529] border-[#1e2d4a] hover:bg-[#111931]/50'
            } ${scanState !== 'idle' ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={scanState === 'idle' ? triggerFileInput : undefined}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileInputChange} 
              className="hidden" 
              disabled={scanState !== 'idle'}
            />
            <Upload className={`w-10 h-10 mx-auto mb-4 ${dragActive ? 'text-cyan-400 animate-bounce' : 'text-slate-400'}`} />
            <h4 className="text-sm font-semibold text-slate-200 font-mono">Drag & Drop suspicious file here</h4>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Supports executables (.exe, .dll, .bin), script modules, or documents</p>
            <button
              id="browse-files-btn"
              disabled={scanState !== 'idle'}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-800 text-cyan-400 hover:text-white hover:border-cyan-400 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              BROWSE LOCAL FILE
            </button>
          </div>

          {/* Uploaded File Details Summary */}
          {selectedFile && (
            <div id="file-details-card" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e2d4a]">
                <span className="text-xs font-bold text-slate-300">Target Metadata Preview</span>
                <button
                  id="reset-scan-btn"
                  onClick={handleReset}
                  className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>CLEAR</span>
                </button>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>File Name:</span>
                  <span className="text-white font-semibold truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                {selectedFile.isGoogleDrive && (
                  <div className="flex justify-between">
                    <span>File Source:</span>
                    <span className="text-cyan-400 flex items-center gap-1 font-bold">
                      <Cloud className="w-3 h-3 text-cyan-400" /> GOOGLE DRIVE
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="text-slate-300">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>File Type:</span>
                  <span className="text-slate-300 truncate max-w-[160px]">{selectedFile.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>SHA-256 Hash:</span>
                  <span className="text-cyan-400 text-[10px] break-all max-w-[180px] text-right">{selectedFile.sha256}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scanner State:</span>
                  <span className={`font-bold uppercase ${
                    scanState === 'idle' ? 'text-slate-400' : 'text-cyan-400 animate-pulse'
                  }`}>
                    {scanState === 'idle' ? 'READY' : scanState}
                  </span>
                </div>
              </div>

              {scanState === 'idle' && (
                <button
                  id="start-hybrid-scan-btn"
                  onClick={handleStartScan}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase font-mono rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Hybrid Scan</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Right Section: Real-time scan telemetry & results */}
        <div id="scan-terminal-section" className="lg:col-span-7 space-y-8">
          
          {/* Active Progress View */}
          {scanState !== 'idle' && (
            <div id="live-progress-card" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a] space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Interactive Pipeline Telemetry</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Live Feedback</span>
              </div>

              <div className="space-y-4">
                {/* Stage 1: Signature Scan Progress Bar */}
                <div id="sig-scan-progress" className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-red-400" />
                      Stage 1: Signature/Hash Search
                    </span>
                    <span className={`${sigProgress === 100 ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'} font-bold`}>
                      {sigProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141f38] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        scanResult?.signatureMatched 
                          ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                          : 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      }`}
                      style={{ width: `${sigProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stage 2: ML Scanners Progress Bar (not shown if signature match aborted pipeline) */}
                {(!scanResult || !scanResult.signatureMatched) && (
                  <div id="ml-scan-progress" className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        Stage 2: Neural ML Heuristics
                      </span>
                      <span className={`${mlProgress === 100 ? 'text-emerald-400' : mlProgress > 0 ? 'text-purple-400 animate-pulse' : 'text-slate-600'} font-bold`}>
                        {mlProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#141f38] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-300"
                        style={{ width: `${mlProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cyber console scrolling terminal */}
          {(scanState !== 'idle' || consoleLogs.length > 0) && (
            <div id="cyber-terminal-card" className="p-5 rounded-xl bg-black border border-[#1e2d4a] font-mono shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-3 text-slate-500 text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CONTAINMENT TERMINAL V2.4</span>
                </div>
                <span>STREAM LOGS</span>
              </div>
              
              <div id="scrolling-terminal-logs" className="space-y-1.5 h-44 overflow-y-auto text-[11px] text-cyan-300/85">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-slate-600">❯</span> {log}
                  </div>
                ))}
                {scanState !== 'finished' && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[10px] italic">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing binary stream...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NO SCAN ACTIVE STATE */}
          {scanState === 'idle' && !scanResult && (
            <div id="idle-scan-alert" className="p-8 border border-dashed border-[#1e2d4a] rounded-xl text-center py-20 bg-[#0e1529]/20">
              <Cpu className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-400 font-mono uppercase">Sandboxed Hybrid Evaluator Ready</h4>
              <p className="text-xs text-slate-500 font-mono mt-1 max-w-sm mx-auto">
                Select one of our suspicious Academic test files or upload a custom file, then trigger "Start Hybrid Scan".
              </p>
            </div>
          )}

          {/* Step 4: Final Decision Card (Renders when scanState === 'finished') */}
          {scanState === 'finished' && scanResult && (
            <div id="scan-verdict-card" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a] space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -z-10"></div>
              
              <div className="flex items-center justify-between pb-4 border-b border-[#1e2d4a]">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">HYBRID SCAN VERDICT</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Evaluation concluded securely</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">ID: {scanResult.id}</span>
              </div>

              {/* Big threat level banner */}
              {scanResult.finalVerdict === 'Malicious' ? (
                <div id="malicious-verdict-banner" className="p-5 rounded-lg bg-red-950/40 border border-red-500/30 flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-red-950 text-red-400 shrink-0">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-500 font-mono uppercase">Threat Level: CRITICAL (Malicious)</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Binary has been classified as containing high-severity malicious payloads. 
                      {scanResult.signatureMatched 
                        ? ` Signature matched known virus: "${scanResult.matchedSignatureName}".` 
                        : ` Machine learning neural heuristics predicted malicious characteristics with high risk score.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div id="benign-verdict-banner" className="p-5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 font-mono uppercase">Threat Level: SECURE (Benign)</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Binary passed standard signature database validation and was classified as clean/benign by the Neural Heuristics classifier. Integrity validated.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid with Signature result + Machine learning detail */}
              <div id="verdict-breakdown-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Stage 1 Block */}
                <div className="p-4 rounded-lg bg-[#0c1224] border border-[#1b2a47] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold">STAGE 1: SIGNATURE</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                      scanResult.signatureMatched ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {scanResult.signatureMatched ? 'MATCHED' : 'NO MATCH'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>Database Match:</span>
                      <span className="text-slate-200">{scanResult.signatureMatched ? 'Yes' : 'No'}</span>
                    </div>
                    {scanResult.signatureMatched && (
                      <div className="flex flex-col text-[10px] bg-red-950/20 p-1.5 rounded border border-red-950 mt-1">
                        <span className="text-slate-300 font-semibold">{scanResult.matchedSignatureName}</span>
                        <span className="text-slate-500 truncate max-w-[200px]">{scanResult.matchedSignatureHash}</span>
                      </div>
                    )}
                    {!scanResult.signatureMatched && (
                      <p className="text-[10px] text-slate-500 leading-normal">
                        No known malware signature found — forwarded to Machine Learning analysis.
                      </p>
                    )}
                  </div>
                </div>

                {/* Stage 2 Block */}
                <div className="p-4 rounded-lg bg-[#0c1224] border border-[#1b2a47] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold">STAGE 2: MACHINE LEARNING</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                      scanResult.signatureMatched 
                        ? 'bg-slate-900 text-slate-500' 
                        : scanResult.finalVerdict === 'Malicious'
                        ? 'bg-purple-950 text-purple-400'
                        : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {scanResult.signatureMatched ? 'SKIPPED' : 'INFERRED'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-2 mt-2">
                    {scanResult.signatureMatched ? (
                      <p className="text-[10px] text-slate-500 leading-normal mt-1">
                        Aborted further processing to contain hazard immediately upon matching virus signatures.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Malicious Conf:</span>
                          <span className="text-purple-400 font-bold">{scanResult.mlMaliciousProbability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Benign Conf:</span>
                          <span className="text-emerald-400 font-bold">{scanResult.mlBenignProbability}%</span>
                        </div>
                        {/* Tiny graphic progress bar */}
                        <div className="w-full h-1.5 bg-[#141f38] rounded-full overflow-hidden mt-1.5 flex">
                          <div className="bg-purple-500 h-full" style={{ width: `${scanResult.mlMaliciousProbability}%` }}></div>
                          <div className="bg-emerald-500 h-full" style={{ width: `${scanResult.mlBenignProbability}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div id="verdict-actions-panel" className="flex items-center gap-3 pt-2">
                <button
                  id="view-detailed-report-btn"
                  onClick={() => onNavigateToResults(scanResult)}
                  className="flex-1 py-2.5 bg-[#16223f] hover:bg-[#1e2d52] border border-[#2b3d63] text-slate-200 hover:text-white font-mono font-bold text-xs rounded-lg transition-all text-center cursor-pointer"
                >
                  EXPLORE FULL NEURAL REPORT
                </button>
                <button
                  id="reset-scanner-ready-btn"
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>NEW SCAN</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

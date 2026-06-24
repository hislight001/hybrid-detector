import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ScanView from './components/ScanView';
import DatabaseView from './components/DatabaseView';
import LogsView from './components/LogsView';
import ResultsView from './components/ResultsView';

import { ActivePage, ScanLog, MalwareSignature } from './types';
import { INITIAL_SIGNATURES, INITIAL_SCAN_LOGS } from './data';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedLog, setSelectedLog] = useState<ScanLog | null>(null);

  // Load persistent signatures or default to initial set
  const [signatures, setSignatures] = useState<MalwareSignature[]>(() => {
    const saved = localStorage.getItem('hybrid_av_signatures');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved signatures:', e);
      }
    }
    return INITIAL_SIGNATURES;
  });

  // Load persistent scan logs or default to initial set
  const [logs, setLogs] = useState<ScanLog[]>(() => {
    const saved = localStorage.getItem('hybrid_av_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved scan logs:', e);
      }
    }
    return INITIAL_SCAN_LOGS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('hybrid_av_signatures', JSON.stringify(signatures));
  }, [signatures]);

  useEffect(() => {
    localStorage.setItem('hybrid_av_logs', JSON.stringify(logs));
  }, [logs]);

  // Handle addition of a signature
  const handleAddSignature = (newSig: Omit<MalwareSignature, 'id' | 'dateAdded'>) => {
    const signature: MalwareSignature = {
      ...newSig,
      id: `sig-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setSignatures(prev => [signature, ...prev]);
  };

  // Handle deletion of a signature
  const handleDeleteSignature = (id: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== id));
  };

  // Handle completion of a threat scan
  const handleScanComplete = (newLog: ScanLog) => {
    setLogs(prev => [...prev, newLog]);
  };

  // Clear all scan logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to completely erase the audited log history?')) {
      setLogs([]);
      localStorage.removeItem('hybrid_av_logs');
    }
  };

  // Navigation handlers
  const handleSelectLog = (log: ScanLog) => {
    setSelectedLog(log);
    setActivePage('results');
  };

  const handlePageChange = (page: ActivePage) => {
    setActivePage(page);
    if (page !== 'results') {
      setSelectedLog(null);
    }
  };

  return (
    <div id="app-root-container" className="flex h-screen w-screen overflow-hidden bg-[#070b16] text-slate-100 font-sans antialiased">
      {/* Sidebar navigation panel */}
      <Sidebar 
        activePage={activePage} 
        onPageChange={handlePageChange} 
        signatureCount={signatures.length}
      />

      {/* Main viewport area */}
      <div id="main-viewport" className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Dynamic page rendering block */}
        <main id="main-content-window" className="flex-1 flex flex-col overflow-hidden">
          {activePage === 'dashboard' && (
            <DashboardView 
              logs={logs}
              signatures={signatures}
              onNavigateToScan={() => handlePageChange('scan')}
              onNavigateToHistory={() => handlePageChange('history')}
              onSelectLog={handleSelectLog}
            />
          )}

          {activePage === 'scan' && (
            <ScanView 
              signatures={signatures}
              onScanComplete={handleScanComplete}
              onNavigateToResults={handleSelectLog}
            />
          )}

          {activePage === 'signatures' && (
            <DatabaseView 
              signatures={signatures}
              onAddSignature={handleAddSignature}
              onDeleteSignature={handleDeleteSignature}
            />
          )}

          {activePage === 'history' && (
            <LogsView 
              logs={logs}
              onSelectLog={handleSelectLog}
              onClearLogs={handleClearLogs}
            />
          )}

          {activePage === 'results' && selectedLog && (
            <ResultsView 
              log={selectedLog}
              onNavigateBack={() => handlePageChange('history')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

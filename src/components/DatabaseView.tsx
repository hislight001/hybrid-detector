import { useState, FormEvent } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  Hash, 
  X,
  Sparkles
} from 'lucide-react';
import { MalwareSignature } from '../types';

interface DatabaseViewProps {
  signatures: MalwareSignature[];
  onAddSignature: (sig: Omit<MalwareSignature, 'id' | 'dateAdded'>) => void;
  onDeleteSignature: (id: string) => void;
}

export default function DatabaseView({ signatures, onAddSignature, onDeleteSignature }: DatabaseViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Add signature form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHash, setNewHash] = useState('');
  const [newFamily, setNewFamily] = useState('Ransomware');
  const [newSeverity, setNewSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [newDesc, setNewDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Extract unique families for filter dropdown
  const uniqueFamilies = Array.from(new Set(signatures.map(s => s.malwareFamily)));

  // Filtered Signatures list
  const filteredSignatures = signatures.filter(sig => {
    const matchesSearch = 
      sig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFamily = familyFilter === 'all' || sig.malwareFamily === familyFilter;
    const matchesSeverity = severityFilter === 'all' || sig.severity === severityFilter;

    return matchesSearch && matchesFamily && matchesSeverity;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim()) {
      setFormError('Signature Name is required.');
      return;
    }

    // Verify SHA-256 hash formatting (64 hex characters)
    const cleanHash = newHash.trim().toLowerCase();
    const hexPattern = /^[0-9a-f]{64}$/;
    if (!hexPattern.test(cleanHash)) {
      setFormError('Please enter a valid 64-character SHA-256 hex string.');
      return;
    }

    // Check for duplicate hashes
    if (signatures.some(s => s.hash.toLowerCase() === cleanHash)) {
      setFormError('This signature hash is already registered in the database.');
      return;
    }

    onAddSignature({
      name: newName,
      hash: cleanHash,
      malwareFamily: newFamily,
      severity: newSeverity,
      description: newDesc || 'Academic laboratory user custom threat signature.'
    });

    // Reset Form
    setNewName('');
    setNewHash('');
    setNewFamily('Ransomware');
    setNewSeverity('High');
    setNewDesc('');
    setShowAddForm(false);
  };

  // Helper to pre-populate custom trigger hashes for testing
  const handleQuickSeed = (type: 'custom_malicious_exe' | 'phishing_hook_bin') => {
    if (type === 'custom_malicious_exe') {
      setNewName('Academic.Demo.Backdoor.Win32');
      // A clean random hash pattern or a particular known value
      setNewHash('5f4dcc3b5aa765d61d8327deb882cf99a12a18ffbf29bcf1ae5cfcf07fcf8222');
      setNewFamily('Trojan/Backdoor');
      setNewSeverity('Critical');
      setNewDesc('Demo backdoor. Upload a file and name it back_door_payload to automatically map to this signature!');
    } else {
      setNewName('Malicious.Macro.Dropper.Office');
      setNewHash('3bc7dc45ea3a18ffbf29bcf1ae5cfcf07fcf81d8327deb882cf99a12a18ffbf3');
      setNewFamily('Macro/Dropper');
      setNewSeverity('High');
      setNewDesc('Academic simulation of embedded macro droppers targeting institutional spreadsheets.');
    }
  };

  return (
    <div id="database-container" className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#070b16]">
      {/* Banner */}
      <div id="database-banner" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0d1c31] to-[#081120] border border-[#1e2d4a] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl -z-10"></div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Academic Signature Database (Hash registry)</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-mono max-w-2xl">
            Static malware signature indexes verified globally. Register custom target hashes here, then run the Threat Scanner on files with the matching hash to trigger signature-based containment.
          </p>
        </div>
        <div>
          <button
            id="open-add-sig-btn"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold font-mono text-xs rounded-xl tracking-wider transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW SIGNATURE</span>
          </button>
        </div>
      </div>

      {/* Grid: Form and Filters / Table */}
      <div id="database-content-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ADD SIGNATURE CARD / MODAL PANEL */}
        {showAddForm && (
          <div id="add-signature-panel" className="lg:col-span-4 p-6 rounded-xl bg-[#0e1529] border border-cyan-500/40 shadow-2xl space-y-5 animate-fade-in relative">
            <button
              id="close-add-form-btn"
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Register Custom Threat Signature</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-1">Populate SHA-256 definitions to test binary trigger paths</p>
            </div>

            {/* Quick Seeding Tooltips */}
            <div className="p-3 bg-cyan-950/25 border border-cyan-900 rounded-lg space-y-2 text-[11px]">
              <div className="text-cyan-400 font-bold font-mono">LAB SEED SHORTCUTS:</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  id="seed-demo-backdoor-btn"
                  onClick={() => handleQuickSeed('custom_malicious_exe')}
                  className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-[10px] text-slate-300 font-mono border border-cyan-800 rounded transition-all"
                >
                  + Seed Backdoor Hash
                </button>
                <button
                  type="button"
                  id="seed-macro-dropper-btn"
                  onClick={() => handleQuickSeed('phishing_hook_bin')}
                  className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-[10px] text-slate-300 font-mono border border-cyan-800 rounded transition-all"
                >
                  + Seed Macro Hash
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {formError && (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-500/30 text-red-400 text-[11px]">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Signature Label/Name:</label>
                <input
                  type="text"
                  id="new-sig-name"
                  placeholder="e.g. Trojan.Win32.Agent.ah"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#070b16] border border-[#1e2d4a] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">SHA-256 Hash Value (64 hex):</label>
                <input
                  type="text"
                  id="new-sig-hash"
                  placeholder="e.g. 5f4dcc3b5aa765d61d8327deb882cf99..."
                  value={newHash}
                  onChange={(e) => setNewHash(e.target.value)}
                  className="w-full bg-[#070b16] border border-[#1e2d4a] rounded px-3 py-2 text-white text-[10px] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-semibold">Family Class:</label>
                  <select
                    id="new-sig-family"
                    value={newFamily}
                    onChange={(e) => setNewFamily(e.target.value)}
                    className="w-full bg-[#070b16] border border-[#1e2d4a] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Ransomware">Ransomware</option>
                    <option value="Trojan">Trojan</option>
                    <option value="Trojan/Backdoor">Trojan/Backdoor</option>
                    <option value="Botnet/DDoS">Botnet/DDoS</option>
                    <option value="Spyware">Spyware</option>
                    <option value="Worm">Worm</option>
                    <option value="Wiper">Wiper</option>
                    <option value="Hacktool">Hacktool</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-semibold">Severity:</label>
                  <select
                    id="new-sig-severity"
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-[#070b16] border border-[#1e2d4a] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block font-semibold">Risk Profile / Description:</label>
                <textarea
                  id="new-sig-desc"
                  placeholder="Describe threat behavioral details..."
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#070b16] border border-[#1e2d4a] rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <button
                type="submit"
                id="submit-new-sig-btn"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs rounded transition-all cursor-pointer"
              >
                COMMIT TO HASH DATABASE
              </button>
            </form>
          </div>
        )}

        {/* DATABASE REPOSITORY MAIN PANEL */}
        <div id="database-table-panel" className={`${showAddForm ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
          
          {/* Query, Search and filter controls */}
          <div id="database-filters-card" className="p-5 rounded-xl bg-[#0e1529] border border-[#1e2d4a] flex flex-col sm:flex-row items-center gap-4">
            
            {/* Search inputs */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                id="db-search"
                placeholder="Search name, hash, family..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#070b16] border border-[#1e2d4a] hover:border-[#2b3d63] rounded-lg pl-10 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Family filter dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                id="db-family-filter"
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="bg-[#070b16] border border-[#1e2d4a] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Families</option>
                {uniqueFamilies.map(fam => (
                  <option key={fam} value={fam}>{fam}</option>
                ))}
              </select>
            </div>

            {/* Severity filter dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                id="db-severity-filter"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-[#070b16] border border-[#1e2d4a] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <span className="text-[10px] font-mono text-slate-500 sm:ml-auto">
              Showing {filteredSignatures.length} of {signatures.length} records
            </span>
          </div>

          {/* Signatures List table */}
          <div id="database-table-card" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a]">
            {filteredSignatures.length === 0 ? (
              <div className="text-center py-12">
                <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-2 animate-pulse" />
                <p className="text-slate-400 text-xs font-mono">No threat signatures match the current filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-[#1e2d4a] text-slate-400 text-[10px] uppercase tracking-wider pb-3">
                      <th className="pb-3 pl-2">Threat Definition / Name</th>
                      <th className="pb-3">Malware Family</th>
                      <th className="pb-3">Severity Rating</th>
                      <th className="pb-3">SHA-256 Signature Profile Hash</th>
                      <th className="pb-3">Registered On</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-[#16223f] text-slate-300">
                    {filteredSignatures.map((sig) => {
                      const isCritical = sig.severity === 'Critical';
                      const isHigh = sig.severity === 'High';
                      return (
                        <tr key={sig.id} className="hover:bg-[#11192e]/40 transition-colors">
                          <td className="py-4 pl-2 max-w-[220px]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-100">{sig.name}</span>
                              <span className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {sig.description}
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                              {sig.malwareFamily}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCritical 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                : isHigh 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {sig.severity}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] max-w-[180px]">
                              <Hash className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate" title={sig.hash}>{sig.hash}</span>
                            </div>
                          </td>
                          <td className="py-4 text-slate-500 text-[11px]">
                            {sig.dateAdded}
                          </td>
                          <td className="py-4 text-right pr-2">
                            {/* Allow deleting only custom added user signatures, or all for university project interaction */}
                            <button
                              id={`delete-signature-${sig.id}`}
                              onClick={() => onDeleteSignature(sig.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 bg-red-950/20 border border-transparent hover:border-red-900 rounded transition-all"
                              title="Delete definition"
                            >
                              <Trash2 className="w-4 h-4" />
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

      </div>

    </div>
  );
}

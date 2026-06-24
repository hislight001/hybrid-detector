import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  File, 
  HardDrive,
  User, 
  LogOut, 
  ShieldCheck, 
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { googleSignIn, logout, initAuth } from '../lib/firebase';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  iconLink?: string;
}

interface GoogleDrivePickerProps {
  onFileSelected: (file: {
    name: string;
    size: number;
    type: string;
    id: string;
    isGoogleDrive: boolean;
    driveFileId?: string;
  }) => void;
  disabled: boolean;
}

export default function GoogleDrivePicker({ onFileSelected, disabled }: GoogleDrivePickerProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        fetchFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        fetchFiles(result.accessToken);
      }
    } catch (err: any) {
      console.error('Error connecting Google Drive:', err);
      setError('Could not connect to Google Drive. Please ensure you authorize the requested scopes.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setFiles([]);
      setSearchTerm('');
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchFiles = async (token: string, search: string = '') => {
    setLoading(true);
    setError(null);
    try {
      // Build search query for Drive API v3
      // Limit to files that are not folders and not trashed
      let queryStr = "trashed = false and mimeType != 'application/vnd.google-apps.folder'";
      if (search.trim()) {
        const escapedSearch = search.replace(/'/g, "\\'");
        queryStr += ` and name contains '${escapedSearch}'`;
      }

      const queryParams = new URLSearchParams({
        q: queryStr,
        pageSize: '40',
        fields: 'files(id, name, mimeType, size, modifiedTime, iconLink)',
        orderBy: 'modifiedTime desc'
      });

      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          handleDisconnect();
          throw new Error('Authentication expired. Please reconnect.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error (${response.status})`);
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('Failed to retrieve drive files:', err);
      setError(err.message || 'Failed to fetch Google Drive files.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      fetchFiles(accessToken, searchTerm);
    }
  };

  const handleRefresh = () => {
    if (accessToken) {
      fetchFiles(accessToken, searchTerm);
    }
  };

  const handleSelectFile = (file: GoogleDriveFile) => {
    if (disabled) return;
    
    // Parse size or fallback to 5KB default for Google proprietary formats which lack size
    const finalSize = file.size ? parseInt(file.size, 10) : 5120;
    
    onFileSelected({
      name: file.name,
      size: finalSize,
      type: file.mimeType || 'application/octet-stream',
      id: `gdrive-${file.id}`,
      isGoogleDrive: true,
      driveFileId: file.id
    });
  };

  return (
    <div id="google-drive-picker-container" className="p-6 rounded-xl bg-[#0e1529] border border-[#1e2d4a] space-y-4 shadow-lg transition-all">
      {/* Header section with drive connection status */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2d4a]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#16223f] border border-[#2b3d63] text-cyan-400">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Google Drive Integration
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">Scan cloud assets directly</p>
          </div>
        </div>

        {user && (
          <button
            id="gdrive-disconnect-btn"
            onClick={handleDisconnect}
            className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors duration-150 px-2.5 py-1 rounded bg-[#131a31] hover:bg-red-950/20 border border-[#1e2d4a] hover:border-red-900/50"
          >
            <LogOut className="w-3 h-3" />
            <span>DISCONNECT</span>
          </button>
        )}
      </div>

      {/* Connection and File Browser Views */}
      {!user ? (
        <div id="gdrive-unconnected-view" className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#131b35] border border-cyan-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <HardDrive className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <p className="text-xs font-semibold text-slate-300 font-mono">Connect Cloud Repository</p>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              Securely authenticate with Google to select and analyze files hosted on your Google Drive for malware or heuristics anomalies.
            </p>
          </div>

          <button
            id="gdrive-connect-btn"
            onClick={handleConnect}
            disabled={isConnecting || disabled}
            className="gsi-material-button mx-auto flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{ width: 'auto', padding: '0 16px', borderRadius: '8px' }}
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-mono text-xs font-semibold text-slate-800">
                {isConnecting ? 'Signing in...' : 'Connect Google Drive'}
              </span>
            </div>
          </button>
        </div>
      ) : (
        <div id="gdrive-explorer-view" className="space-y-4">
          {/* Active Profile Info */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0a0f1d] border border-[#1b2a47] text-xs font-mono">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 border border-cyan-400 flex items-center justify-center text-white text-[9px] font-bold">
              {user.email?.slice(0, 2).toUpperCase() || 'GD'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-slate-300 block truncate text-[11px] font-semibold">{user.displayName || 'Authorized User'}</span>
              <span className="text-slate-500 block truncate text-[10px]">{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CONNECTED</span>
            </div>
          </div>

          {/* Search bar and refresh btn */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Drive files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || disabled}
                className="w-full bg-[#090e1c] border border-[#1d2c49] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <button
              type="button"
              id="gdrive-refresh-btn"
              onClick={handleRefresh}
              disabled={loading || disabled}
              className="p-2.5 bg-[#131b31] border border-[#1e2d4a] hover:border-cyan-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Refresh files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </form>

          {/* Files container list */}
          <div id="gdrive-files-list" className="max-h-56 overflow-y-auto border border-[#1d2c49] rounded-lg bg-[#070b16] divide-y divide-[#16223b]">
            {loading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                <span className="text-xs text-slate-500 font-mono">Querying Drive nodes...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center space-y-1">
                <File className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                <p className="text-xs text-slate-400 font-mono">No matching files found</p>
                <p className="text-[10px] text-slate-600 font-sans">Folders are excluded. Only uploadable files are visible.</p>
              </div>
            ) : (
              files.map((file) => (
                <button
                  key={file.id}
                  id={`gdrive-file-${file.id}`}
                  onClick={() => handleSelectFile(file)}
                  disabled={disabled}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#111931]/40 flex items-center justify-between gap-3 text-xs font-mono transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-[#131d33] border border-[#233555] flex items-center justify-center shrink-0 group-hover:border-cyan-500/30 transition-colors">
                      {file.iconLink ? (
                        <img 
                          src={file.iconLink} 
                          alt="Drive Icon" 
                          className="w-4 h-4" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback if google drive avatar blocks
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <File className="w-3.5 h-3.5 text-cyan-500" />
                      )}
                    </div>
                    <div className="truncate pr-1">
                      <span className="text-slate-200 group-hover:text-cyan-400 transition-colors block truncate font-medium">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                        {file.mimeType.replace('application/', '')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div className="hidden sm:block">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Cloud Doc'}
                      </span>
                      <span className="text-[9px] text-slate-600 block">
                        {new Date(file.modifiedTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/50 text-red-400 text-[11px] font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

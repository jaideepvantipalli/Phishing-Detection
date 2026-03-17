import { useState, useCallback } from 'react';
import {
  Link2, Mail, MessageSquare, Scan, RotateCcw,
  ShieldCheck, ShieldAlert, AlertTriangle, FileText,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import InputField from '../components/InputField';
import ProgressCircle from '../components/ProgressCircle';
import RiskBadge from '../components/RiskBadge';
import LoadingScanner from '../components/LoadingScanner';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { performAnalysis, getRiskColor } from '../utils/analyzer';

const tabs = [
  { id: 'url', label: 'URL', icon: Link2, placeholder: 'https://example.com/suspicious-link' },
  { id: 'email', label: 'Email', icon: Mail, placeholder: 'Paste email content here, including headers and body...' },
  { id: 'text', label: 'Text Message', icon: MessageSquare, placeholder: 'Paste the suspicious text message here...' },
];

export default function Analyzer({ onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const activeTabConfig = tabs.find((t) => t.id === activeTab);

  const validate = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter content to analyze');
      return false;
    }
    if (activeTab === 'url') {
      const urlPattern = /^https?:\/\/.+\..+/i;
      if (!urlPattern.test(input.trim()) && !input.includes('.')) {
        setError('Please enter a valid URL (e.g., https://example.com)');
        return false;
      }
    }
    if (activeTab === 'email' && input.trim().length < 20) {
      setError('Please paste the full email content for accurate analysis');
      return false;
    }
    setError('');
    return true;
  }, [input, activeTab]);

  const handleAnalyze = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    setResult(null);

    try {
      const analysisResult = await performAnalysis(input, activeTab);
      setResult(analysisResult);
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [input, activeTab, validate, onAnalysisComplete]);

  const handleReset = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setInput('');
    setResult(null);
    setError('');
  };

  const riskColor = result ? getRiskColor(result.riskScore) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyber-accent/10">
            <Scan className="w-6 h-6 text-cyber-accent" />
          </div>
          Threat Analyzer
        </h1>
        <p className="text-cyber-muted mt-1 ml-14">
          Analyze URLs, emails, and text messages for phishing threats with AI-powered detection
        </p>
      </div>

      {/* Input Section */}
      <Card glow={!result}>
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-cyber-darker rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyber-card text-cyber-accent shadow-lg'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <InputField
          multiline={activeTab !== 'url'}
          rows={activeTab === 'email' ? 8 : 4}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError('');
          }}
          placeholder={activeTabConfig.placeholder}
          error={error}
          icon={activeTabConfig.icon}
        />

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={handleAnalyze}
            loading={loading}
            disabled={!input.trim()}
            icon={Scan}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
          {(input || result) && (
            <Button variant="ghost" onClick={handleReset} icon={RotateCcw}>
              Clear
            </Button>
          )}
        </div>

        {/* Sample inputs */}
        {!result && !loading && (
          <div className="mt-4 pt-4 border-t border-cyber-border/50">
            <p className="text-xs text-cyber-muted mb-2">Try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {activeTab === 'url' && (
                <>
                  <SampleChip onClick={() => setInput('http://paypa1-secure.login-verify.com/account')} label="Suspicious PayPal" danger />
                  <SampleChip onClick={() => setInput('https://docs-google.share-document.net/view')} label="Fake Google Docs" warning />
                  <SampleChip onClick={() => setInput('https://www.google.com/search?q=weather')} label="Legitimate Google" safe />
                </>
              )}
              {activeTab === 'email' && (
                <>
                  <SampleChip
                    onClick={() =>
                      setInput(
                        'From: security@amaz0n-alerts.com\nSubject: URGENT: Your account has been compromised!\n\nDear Customer,\n\nWe detected unusual activity on your account. Your account will be SUSPENDED within 24 hours unless you verify your identity immediately.\n\nClick here to verify: http://amaz0n-verify.com/secure\n\nAmazon Security Team'
                      )
                    }
                    label="Phishing Email"
                    danger
                  />
                  <SampleChip
                    onClick={() =>
                      setInput(
                        'From: noreply@github.com\nSubject: [GitHub] Your verification code\n\nHi komesh,\n\nYour GitHub verification code is: 847291\n\nThis code expires in 10 minutes.\n\nGitHub Support'
                      )
                    }
                    label="Legitimate Email"
                    safe
                  />
                </>
              )}
              {activeTab === 'text' && (
                <>
                  <SampleChip
                    onClick={() =>
                      setInput(
                        'ALERT: Your bank account has been locked due to suspicious activity. Verify now at http://chase-secure-login.tk or your funds will be frozen. Reply STOP to cancel.'
                      )
                    }
                    label="Smishing Attack"
                    danger
                  />
                  <SampleChip
                    onClick={() =>
                      setInput('Your package has been delivered to your front door. Track at ups.com/track?id=1Z999AA10123456784')
                    }
                    label="Legitimate SMS"
                    safe
                  />
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <LoadingScanner type={activeTab} />
        </Card>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score Overview */}
          <Card glow>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Score circle */}
              <div className="flex-shrink-0">
                <ProgressCircle score={result.riskScore} />
              </div>

              {/* Classification */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <RiskBadge classification={result.classification} size="lg" />
                  <span className="px-3 py-1 bg-cyber-dark text-[10px] font-mono text-cyber-muted border border-cyber-border rounded-md">
                    ALGO_V5.2_MODEL_RF
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {result.classification === 'High Risk'
                      ? 'Threat Signature Detected'
                      : result.classification === 'Medium Risk'
                      ? 'Suspicious Activity Flagged'
                      : 'Security Clearance: Verified'}
                  </h2>
                  <p className="text-cyber-muted text-lg max-w-xl">
                    {result.classification === 'High Risk'
                      ? 'Critical phishing markers identified. This content matches known malicious patterns.'
                      : result.classification === 'Medium Risk'
                      ? 'Caution: Some heuristic markers suggest potential deceptive intent.'
                      : 'Analysis complete. Content matches legitimate communication signatures.'}
                  </p>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-cyber-muted" />
                    <span className="text-cyber-muted">Type:</span>
                    <span className="text-cyber-text capitalize">{result.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-cyber-muted" />
                    <span className="text-cyber-muted">Findings:</span>
                    <span className="text-cyber-text">{result.reasons.length} indicators</span>
                  </div>
                </div>
              </div>

              {/* Score meter visual */}
              <div className="hidden lg:flex flex-col gap-2 w-48">
                <ScoreMeter score={result.riskScore} />
              </div>
            </div>
          </Card>

          {/* Detailed Analysis */}
          <Card>
            <ExplainabilityPanel result={result} />
          </Card>
        </div>
      )}
    </div>
  );
}

function SampleChip({ onClick, label, danger, warning, safe }) {
  const color = danger
    ? 'border-cyber-danger/30 text-cyber-danger hover:bg-cyber-danger/10'
    : warning
    ? 'border-cyber-warning/30 text-cyber-warning hover:bg-cyber-warning/10'
    : 'border-cyber-safe/30 text-cyber-safe hover:bg-cyber-safe/10';

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${color}`}
    >
      {label}
    </button>
  );
}

function ScoreMeter({ score }) {
  const segments = [
    { range: '0-30', label: 'Safe', color: '#22c55e', active: score <= 30 },
    { range: '31-70', label: 'Caution', color: '#fbbf24', active: score > 30 && score <= 70 },
    { range: '71-100', label: 'Danger', color: '#ef4444', active: score > 70 },
  ];

  return (
    <div className="space-y-2">
      {segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-2 flex-1 rounded-full transition-all duration-500"
            style={{
              backgroundColor: seg.active ? seg.color : `${seg.color}20`,
              boxShadow: seg.active ? `0 0 8px ${seg.color}40` : 'none',
            }}
          />
          <span
            className="text-[10px] font-mono w-12 text-right"
            style={{ color: seg.active ? seg.color : '#64748b' }}
          >
            {seg.range}
          </span>
        </div>
      ))}
    </div>
  );
}

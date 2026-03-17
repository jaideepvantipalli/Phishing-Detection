import { mockAnalysisResults } from '../data/mockData';

const phishingKeywords = [
  'urgent', 'immediately', 'suspended', 'verify', 'confirm', 'account',
  'locked', 'unauthorized', 'click here', 'act now', 'limited time',
  'password', 'ssn', 'credit card', 'bank account', 'wire transfer',
  'congratulations', 'winner', 'prize', 'claim', 'free',
];

const suspiciousDomains = ['.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.xyz'];

export const legitimateDomains = [
  'google.com', 'github.com', 'microsoft.com', 'apple.com', 'amazon.com',
  'facebook.com', 'twitter.com', 'linkedin.com', 'netflix.com', 'ups.com',
  'fedex.com', 'paypal.com', 'chase.com', 'bankofamerica.com',
];

function getRandomResult(type) {
  const results = mockAnalysisResults[type];
  if (!results) return null;
  const keys = Object.keys(results);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return results[randomKey];
}

function analyzeInput(input, type) {
  const lowerInput = input.toLowerCase();

  if (type === 'url') {
    for (const domain of legitimateDomains) {
      if (lowerInput.includes(domain)) {
        return { ...mockAnalysisResults.url.low, input, timestamp: new Date().toISOString() };
      }
    }
    for (const ext of suspiciousDomains) {
      if (lowerInput.includes(ext)) {
        return { ...mockAnalysisResults.url.high, input, timestamp: new Date().toISOString() };
      }
    }
    const keywordCount = phishingKeywords.filter(kw => lowerInput.includes(kw)).length;
    if (keywordCount >= 2 || lowerInput.includes('http://')) {
      return { ...mockAnalysisResults.url.high, input, timestamp: new Date().toISOString() };
    }
    return { ...mockAnalysisResults.url.medium, input, timestamp: new Date().toISOString() };
  }

  if (type === 'email') {
    const keywordCount = phishingKeywords.filter(kw => lowerInput.includes(kw)).length;
    if (keywordCount >= 3) {
      return { ...mockAnalysisResults.email.high, input, timestamp: new Date().toISOString() };
    }
    return { ...mockAnalysisResults.email.low, input, timestamp: new Date().toISOString() };
  }

  if (type === 'text') {
    const keywordCount = phishingKeywords.filter(kw => lowerInput.includes(kw)).length;
    if (keywordCount >= 2) {
      return { ...mockAnalysisResults.text.high, input, timestamp: new Date().toISOString() };
    }
    return { ...mockAnalysisResults.text.low, input, timestamp: new Date().toISOString() };
  }

  return getRandomResult(type);
}

export function performAnalysis(input, type) {
  return new Promise((resolve) => {
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const result = analyzeInput(input, type);
      resolve(result);
    }, delay);
  });
}

export function getRiskColor(score) {
  if (score <= 30) return { primary: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: 'Low Risk' };
  if (score <= 70) return { primary: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', label: 'Medium Risk' };
  return { primary: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'High Risk' };
}

export function getSeverityColor(severity) {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#fbbf24';
    case 'low': return '#3b82f6';
    case 'safe': return '#22c55e';
    default: return '#64748b';
  }
}

export function formatTimestamp(ts) {
  const date = new Date(ts);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

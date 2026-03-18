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

const suspiciousWords = [
  'login', 'verify', 'confirm', 'account', 'bank', 'secure', 'update',
  'billing', 'payment', 'signin', 'support', 'service', 'limited',
];

const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.buzz', '.top', '.xyz', '.site', '.info'];

/**
 * Checks for homograph attacks (e.g., paypa1 instead of paypal)
 */
function checkHomograph(input, brand) {
  const substitutions = { '0': 'o', '1': 'l', 'v': 'u', 'vv': 'w', 'rn': 'm' };
  let normalized = input.toLowerCase();
  for (const [key, val] of Object.entries(substitutions)) {
    normalized = normalized.replace(new RegExp(key, 'g'), val);
  }
  return normalized.includes(brand) && !input.toLowerCase().includes(brand);
}

function analyzeInput(input, type) {
  const lowerInput = input.toLowerCase();
  const result = {
    riskScore: 0,
    classification: 'Low Risk',
    input,
    type,
    timestamp: new Date().toISOString(),
    reasons: [],
  };

  if (type === 'url') {
    // 1. Whitelist Check
    for (const domain of legitimateDomains) {
      if (lowerInput.includes(domain)) {
        result.riskScore = 5;
        result.reasons.push({ text: `Verified legitimate domain: ${domain}`, severity: 'safe' });
        return result;
      }
    }

    // 2. Protocol Check
    if (lowerInput.startsWith('http://')) {
      result.riskScore += 25;
      result.reasons.push({ text: 'Uses insecure HTTP protocol (no encryption)', severity: 'high', keyword: 'http' });
    }

    // 3. TLD Check
    for (const tld of suspiciousTLDs) {
      if (lowerInput.endsWith(tld) || lowerInput.includes(`${tld}/`)) {
        result.riskScore += 30;
        result.reasons.push({ text: `Uses suspicious TLD (${tld}) commonly associated with phishing`, severity: 'high', keyword: tld });
        break;
      }
    }

    // 4. Homograph/Lookalike Check
    const majorBrands = ['paypal', 'google', 'amazon', 'microsoft', 'apple', 'netflix', 'chase', 'bankofamerica'];
    for (const brand of majorBrands) {
      if (checkHomograph(lowerInput, brand)) {
        result.riskScore += 45;
        result.reasons.push({ text: `Detected potential homograph attack mimicking ${brand}`, severity: 'critical', keyword: brand });
        break;
      }
    }

    // 5. Keyword Check in Path/Subdomain
    const foundKeywords = suspiciousWords.filter(word => lowerInput.includes(word));
    if (foundKeywords.length > 0) {
      result.riskScore += 15 * Math.min(foundKeywords.length, 3);
      result.reasons.push({ text: `Sensitive keywords detected: ${foundKeywords.join(', ')}`, severity: 'medium', keyword: foundKeywords[0] });
    }

    // 6. Structural Check
    if (lowerInput.split('.').length > 4) {
      result.riskScore += 20;
      result.reasons.push({ text: 'High number of subdomains detected (common in obfuscation)', severity: 'medium' });
    }

    if (/\d+\.\d+\.\d+\.\d+/.test(lowerInput)) {
      result.riskScore += 40;
      result.reasons.push({ text: 'Direct IP address access (highly suspicious)', severity: 'critical' });
    }
  } else {
    // Email/Text Heuristics
    const foundKeywords = suspiciousWords.filter(word => lowerInput.includes(word));
    const urgencyWords = ['urgent', 'immediately', 'suspended', 'locked', 'action required', '24 hours'];
    const foundUrgency = urgencyWords.filter(word => lowerInput.includes(word));

    if (foundKeywords.length > 0) {
      result.riskScore += 20 * Math.min(foundKeywords.length, 3);
      result.reasons.push({ text: `Sensitive topics found: ${foundKeywords.join(', ')}`, severity: 'medium' });
    }
    if (foundUrgency.length > 0) {
      result.riskScore += 30;
      result.reasons.push({ text: `Urgency tactics detected: ${foundUrgency.join(', ')}`, severity: 'high' });
    }
    if (lowerInput.includes('http://')) {
      result.riskScore += 20;
      result.reasons.push({ text: 'Contains insecure links', severity: 'medium' });
    }
  }

  // Final Classification
  result.riskScore = Math.min(result.riskScore, 100);
  if (result.riskScore > 70) result.classification = 'High Risk';
  else if (result.riskScore > 30) result.classification = 'Medium Risk';
  else result.classification = 'Low Risk';

  // If no reasons, add a fallback
  if (result.reasons.length === 0) {
    result.riskScore = 15;
    result.reasons.push({ text: 'No immediate threats detected by local heuristics', severity: 'safe' });
  }

  return result;
}

export function performAnalysis(input, type) {
  return new Promise((resolve) => {
    // Artificial delay to simulate processing
    const delay = 1000 + Math.random() * 1000;
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

import { performAnalysis, legitimateDomains } from '../utils/analyzer';
import { mockHistory, mockStats, simulationScenarios } from '../data/mockData';
import storage from './storage';
import groq from './groq';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle API calls with automatic mock fallback
 */
async function fetchWithFallback(endpoint, options, fallbackFn, mockData) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    // Save real results to local storage if they come from API
    if (endpoint.startsWith('/analyze')) {
      await storage.saveScanResult(result);
    }
    return result;
  } catch (error) {
    // Silence 404 warnings as we expect to fall back to mock data in extension-only mode
    if (!error.message?.includes('404')) {
      console.warn(`API call to ${endpoint} failed, falling back to mock data.`, error);
    }
    
    if (fallbackFn) {
      try {
        const result = await fallbackFn();
        // Persistent AI results
        if (endpoint.startsWith('/analyze')) {
          await storage.saveScanResult(result);
        }
        return result;
      } catch (fallbackError) {
        console.error('AI Fallback failed, using local heuristics:', fallbackError);
        // Secondary fallback to local heuristics if AI fails
        const localResult = await performAnalysis(options.body ? JSON.parse(options.body).url || JSON.parse(options.body).content : '', endpoint.split('/').pop());
        await storage.saveScanResult(localResult);
        return localResult;
      }
    }
    return mockData;
  }
}

export const api = {
  /**
   * Analyze a URL for phishing threats
   */
  async analyzeURL(url) {
    const lowerUrl = url.toLowerCase();
    
    // Whitelist check: if it's a known legitimate domain, return safe immediately
    for (const domain of legitimateDomains) {
      if (lowerUrl.includes(domain)) {
        const result = {
          riskScore: 5,
          classification: 'Low Risk',
          type: 'url',
          input: url,
          timestamp: new Date().toISOString(),
          reasons: [
            { text: `Verified legitimate domain: ${domain}`, severity: 'safe' }
          ]
        };
        await storage.saveScanResult(result);
        return result;
      }
    }

    return fetchWithFallback(
      '/analyze/url',
      {
        method: 'POST',
        body: JSON.stringify({ url }),
      },
      () => groq.analyzeContent(url, 'url')
    );
  },

  /**
   * Analyze email content for phishing threats
   */
  async analyzeEmail(content) {
    return fetchWithFallback(
      '/analyze/email',
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      },
      () => groq.analyzeContent(content, 'email')
    );
  },

  /**
   * Analyze text message content for phishing threats
   */
  async analyzeText(content) {
    return fetchWithFallback(
      '/analyze/text',
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      },
      () => groq.analyzeContent(content, 'text')
    );
  },

  /**
   * Fetch scan history
   */
  async getHistory() {
    const history = await storage.getHistory();
    if (history && history.length > 0) return history;
    return mockHistory;
  },

  /**
   * Fetch aggregate security stats
   */
  async getStats() {
    const stats = await storage.getStats();
    if (stats && stats.totalScans > 0) return stats;
    return mockStats;
  },

  /**
   * Fetch simulation scenarios
   */
  async getSimulationScenarios() {
    return simulationScenarios;
  },

  /**
   * Clear local history
   */
  async clearHistory() {
    await storage.clearHistory();
  }
};

export default api;

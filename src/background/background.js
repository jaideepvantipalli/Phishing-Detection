// Background service worker
import api from '../services/api';

chrome.runtime.onInstalled.addListener(() => {
  console.log('PhishGuard AI Extension installed');
  chrome.storage.local.set({ 
    isExtensionEnabled: true,
    autoDeleteDays: 0
  });
});

// Intercept navigations for real-time protection
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only intercept top-level frames
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

  chrome.storage.local.get(['isExtensionEnabled'], (result) => {
    if (result.isExtensionEnabled === false) return;

    // Simple heuristic to avoid blocking everything
    // We want to block if:
    // 1. It's NOT a whitelisted domain
    // 2. It contains suspicious keywords
    const lowerUrl = url.toLowerCase();
    const suspiciousKeywords = ['phish', 'verify', 'secure', 'login', 'update', 'account', 'banking', 'confirm'];
    const isSuspicious = suspiciousKeywords.some(kw => lowerUrl.includes(kw));

    if (isSuspicious) {
      // Redirect to the internal verification page
      const verifyUrl = chrome.runtime.getURL(`verify.html?url=${encodeURIComponent(url)}`);
      chrome.tabs.update(details.tabId, { url: verifyUrl });
    }
  });
});

// Handle analysis requests from verify page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ANALYZE_LINK') {
    api.analyzeURL(message.url)
      .then(result => {
        sendResponse(result);
      })
      .catch(err => {
        console.error('Background Analysis Error:', err);
        sendResponse({ classification: 'Error', reasons: [{ text: 'Analysis failed' }] });
      });
    return true; // Keep channel open for async response
  }
});

// Listen for tab updates for post-load scanning (banner)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.includes('verify.html')) {
    chrome.storage.local.get(['isExtensionEnabled'], async (result) => {
      if (result.isExtensionEnabled === false) return;

      try {
        const analysisResult = await api.analyzeURL(tab.url);
        
        if (analysisResult.classification === 'High Risk') {
          chrome.tabs.sendMessage(tabId, {
            action: 'SHOW_WARNING',
            data: analysisResult
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Tab Update Analysis Error:', err);
      }
    });
  }
});

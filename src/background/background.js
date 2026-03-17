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
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only intercept top-level frames
  if (details.frameId !== 0) return;

  const url = details.url;
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) return;

  chrome.storage.local.get(['isExtensionEnabled'], async (result) => {
    if (result.isExtensionEnabled === false) return;

    // Deep Redirect Analysis
    const finalUrl = await followRedirects(url);
    const lowerUrl = finalUrl.toLowerCase();
    
    const suspiciousKeywords = ['phish', 'verify', 'secure', 'login', 'update', 'account', 'banking', 'confirm'];
    const isSuspicious = suspiciousKeywords.some(kw => lowerUrl.includes(kw));

    if (isSuspicious || finalUrl !== url) {
      // Redirect to the internal verification page
      // pass both original and final for context
      const verifyUrl = chrome.runtime.getURL(`verify.html?url=${encodeURIComponent(finalUrl)}&original=${encodeURIComponent(url)}`);
      chrome.tabs.update(details.tabId, { url: verifyUrl });
    }
  });
});

async function followRedirects(url, depth = 0) {
  if (depth >= 5) return url; // Limit to 5 hops
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'manual',
      mode: 'no-cors' 
    });
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        // Handle relative URLs
        const nextUrl = new URL(location, url).href;
        return followRedirects(nextUrl, depth + 1);
      }
    }
    return url;
  } catch (e) {
    return url; // On error, return current
  }
}

// Handle analysis requests from verify page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ANALYZE_LINK') {
    (async () => {
      const finalUrl = await followRedirects(message.url);
      const result = await api.analyzeURL(finalUrl);
      sendResponse({ ...result, finalUrl });
    })();
    return true; 
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

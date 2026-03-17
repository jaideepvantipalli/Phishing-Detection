// Background service worker
import api from '../services/api';

// In-memory, per-tab, one-time bypass map to prevent verify → target → verify loops
const tabBypassMap = new Map();

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

  chrome.storage.local.get(['isExtensionEnabled', 'bypassedUrls'], async (result) => {
    if (result.isExtensionEnabled === false) return;

    // Check if URL is in persistent bypass list
    const bypassedUrls = result.bypassedUrls || [];
    if (bypassedUrls.includes(url)) return;

    // Check if URL has a one-time, per-tab bypass (e.g., after verify.html redirects back)
    const tabBypassSet = tabBypassMap.get(details.tabId);
    if (tabBypassSet && tabBypassSet.has(url)) {
      tabBypassSet.delete(url);
      if (tabBypassSet.size === 0) {
        tabBypassMap.delete(details.tabId);
      }
      return;
    }

    // Deep Redirect Analysis
    const finalUrl = await followRedirects(url);
    const lowerUrl = finalUrl.toLowerCase();
    
    // Check if finalUrl is in persistent bypass list too
    if (bypassedUrls.includes(finalUrl)) return;
    
    const suspiciousKeywords = ['phish', 'verify', 'secure', 'login', 'update', 'account', 'banking', 'confirm'];
    const isSuspicious = suspiciousKeywords.some(kw => lowerUrl.includes(kw));

    if (isSuspicious || finalUrl !== url) {
      // Before redirecting to the internal verification page, register a one-time bypass
      // so that when verify.html sends the user back to the target URL, it is not re-intercepted.
      let perTabBypass = tabBypassMap.get(details.tabId);
      if (!perTabBypass) {
        perTabBypass = new Set();
        tabBypassMap.set(details.tabId, perTabBypass);
      }
      // Allow both the original and final URLs once for this tab
      perTabBypass.add(url);
      perTabBypass.add(finalUrl);

      // Redirect to the internal verification page
      const verifyUrl = chrome.runtime.getURL(`verify.html?url=${encodeURIComponent(finalUrl)}&original=${encodeURIComponent(url)}`);
      chrome.tabs.update(details.tabId, { url: verifyUrl });
    }
  });
});

async function followRedirects(url, depth = 0) {
  if (depth >= 5) return url;
  
  try {
    // In extension service worker with host_permissions, 
    // we don't need no-cors and can read headers.
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'manual'
    });
    
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const nextUrl = new URL(location, url).href;
        return followRedirects(nextUrl, depth + 1);
      }
    }
    return url;
  } catch (e) {
    // Redirect chain interrupted or CORS issue on certain sites
    return url;
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

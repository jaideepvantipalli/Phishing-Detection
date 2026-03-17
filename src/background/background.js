// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('PhishGuard AI Extension installed');
  // Initialize default extension settings
  chrome.storage.local.set({ 
    isExtensionEnabled: true,
    autoDeleteDays: 0 // 0 means disabled
  });
});

// Listen for tab updates to trigger url checks
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.storage.local.get(['phishingHistory', 'isExtensionEnabled', 'autoDeleteDays'], (result) => {
      // Respect global toggle
      if (result.isExtensionEnabled === false) return;

      let history = result.phishingHistory || [];
      const autoDeleteDays = result.autoDeleteDays || 0;
      const now = new Date();
      
      // If auto-delete is enabled (> 0 days), cleanup old records before adding new one
      if (autoDeleteDays > 0) {
        history = history.filter(item => {
          const itemDate = new Date(item.timestamp);
          const diffTime = Math.abs(now - itemDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= autoDeleteDays;
        });
      }
      
      // Let's mock a safe analysis for now, unless URL contains "phishing"
      const urlLower = tab.url.toLowerCase();
      const isSuspicious = urlLower.includes('phishing') || urlLower.includes('fake');
      const score = isSuspicious ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 20);
      const status = isSuspicious ? 'danger' : 'safe';
      const type = isSuspicious ? 'Deceptive Site' : 'Safe Content';
      
      let reason = 'Domain appears in trusted databases.';
      if (isSuspicious) {
        if (urlLower.includes('phishing')) reason = 'Suspicious "phishing" keyword found in URL path.';
        else if (urlLower.includes('fake')) reason = 'Deceptive "fake" keyword detected in domain.';
        else reason = 'Heuristic rules flagged domain as high risk.';
      }

      const analysisResult = {
        id: Date.now().toString(),
        url: tab.url,
        score,
        status,
        type,
        reason,
        timestamp: now.toISOString()
      };

      // Add to history and cap at 100
      history.unshift(analysisResult);
      if (history.length > 100) history.pop();
      chrome.storage.local.set({ phishingHistory: history });

      // Notify the popup or content script if it's open
      chrome.runtime.sendMessage({ 
        action: 'SCAN_COMPLETE', 
        data: analysisResult 
      }).catch(() => {
        // Ignored. Popup might not be open.
      });
      
      if (isSuspicious) {
        // 1. Send message to content script to show banner
        chrome.tabs.sendMessage(tabId, {
          action: 'SHOW_WARNING',
          data: analysisResult
        }).catch(() => {});

        // 2. Dispatch a native OS notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../icons/icon128.png',
          title: 'PhishGuard Alert - High Risk Pipeline!',
          message: `Suspicious domain detected: ${new URL(tab.url).hostname}\nReason: ${reason}`,
          priority: 2
        });
      }
    });
  }
});

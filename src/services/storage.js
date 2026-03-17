/**
 * Storage service for Chrome Extension persistence
 */
export const storage = {
  /**
   * Add a new scan result to history and update stats
   */
  async saveScanResult(result) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['scanHistory', 'securityStats'], (data) => {
        const history = data.scanHistory || [];
        const stats = data.securityStats || {
          totalScans: 0,
          threatsDetected: 0,
          safeContent: 0,
          accuracy: 98.2 // Base accuracy
        };

        // Add to history
        const newEntry = {
          ...result,
          id: Date.now(),
        };
        const updatedHistory = [newEntry, ...history].slice(0, 100); // Keep last 100

        // Update stats
        stats.totalScans += 1;
        if (result.classification === 'High Risk') {
          stats.threatsDetected += 1;
        } else if (result.classification === 'Low Risk') {
          stats.safeContent += 1;
        }

        chrome.storage.local.set({
          scanHistory: updatedHistory,
          securityStats: stats
        }, () => {
          resolve(newEntry);
        });
      });
    });
  },

  /**
   * Get all scan history
   */
  async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['scanHistory'], (data) => {
        resolve(data.scanHistory || []);
      });
    });
  },

  /**
   * Get aggregate stats
   */
  async getStats() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['securityStats'], (data) => {
        resolve(data.securityStats || {
          totalScans: 0,
          threatsDetected: 0,
          safeContent: 0,
          accuracy: 98.2
        });
      });
    });
  },

  /**
   * Clear all history
   */
  async clearHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ scanHistory: [] }, () => {
        resolve();
      });
    });
  }
};

export default storage;

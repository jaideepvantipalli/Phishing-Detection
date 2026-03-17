// Content Script - Runs in the context of the web page
// jsQR is loaded via manifest as a global
const jsQR = window.jsQR;

// Safety wrapper for chrome.runtime.sendMessage
function safeSendMessage(message, callback) {
  try {
    if (chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          // Context likely invalidated, ignore quietly
          return;
        }
        if (callback) callback(response);
      });
    }
  } catch (e) {
    // Extension context likely invalidated
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SHOW_WARNING') {
    showWarningBanner(message.data);
  }
});

// Quishing Protection: Scan for QR codes
const scannedImages = new Set();
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.tagName === 'IMG') {
      scanImage(entry.target);
    }
  });
}, { threshold: 0.1 });

// Watch for new images
const docObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.tagName === 'IMG') observer.observe(node);
      if (node.querySelectorAll) {
        node.querySelectorAll('img').forEach(img => observer.observe(img));
      }
    });
  });
});

if (document.body) {
  docObserver.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll('img').forEach(img => observer.observe(img));
}

async function scanImage(img) {
  if (scannedImages.has(img.src) || !img.complete || img.naturalWidth === 0) return;
  scannedImages.add(img.src);

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data) {
      const url = code.data;
      if (url.startsWith('http')) {
        safeSendMessage({ action: 'ANALYZE_LINK', url }, (response) => {
          if (response && response.classification === 'High Risk') {
            markMaliciousQR(img, url, response);
          }
        });
      }
    }
  } catch (e) {
    // console.log('QR Scan failed', e);
  }
}

function markMaliciousQR(img, url, data) {
  const rect = img.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.className = 'phishguard-qr-alert';
  overlay.style.cssText = `
    position: absolute;
    top: ${rect.top + window.scrollY}px;
    left: ${rect.left + window.scrollX}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    background: rgba(239, 68, 68, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    cursor: pointer;
    border: 2px solid #ef4444;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    padding: 10px;
    box-sizing: border-box;
  `;
  overlay.innerHTML = `⚠️ Malicious QR Detected! Click to view details.`;
  
  overlay.onclick = () => {
    try {
      if (chrome.runtime && chrome.runtime.id) {
        window.location.href = chrome.runtime.getURL(`verify.html?url=${encodeURIComponent(url)}`);
      }
    } catch (e) {
      // Ignore invalidated context
    }
  };

  document.body.appendChild(overlay);
}

function showWarningBanner(data) {
  if (document.getElementById('phishguard-warning-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'phishguard-warning-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #ef4444;
    color: white;
    text-align: center;
    padding: 12px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    font-weight: bold;
    z-index: 2147483647;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  `;

  banner.innerHTML = `
    <span>⚠️ <strong>PhishGuard AI Alert:</strong> This site has a high risk score of ${data.riskScore}%. Proceed with caution!</span>
    <button id="phishguard-dismiss" style="background: white; color: #ef4444; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">Dismiss</button>
  `;

  document.body.prepend(banner);
  document.getElementById('phishguard-dismiss').addEventListener('click', () => banner.remove());
}

// Content Script - Runs in the context of the web page

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'SHOW_WARNING') {
    showWarningBanner(message.data);
  }
});

function showWarningBanner(data) {
  // Check if banner already exists
  if (document.getElementById('phishguard-warning-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'phishguard-warning-banner';
  
  // Basic inline styling to avoid relying on external CSS
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
    <span>⚠️ <strong>PhishGuard AI Alert:</strong> This site (${data.type}) has a high risk score of ${data.score}%. Proceed with caution!</span>
    <button id="phishguard-dismiss" style="background: white; color: #ef4444; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">Dismiss</button>
  `;

  document.body.prepend(banner);

  document.getElementById('phishguard-dismiss').addEventListener('click', () => {
    banner.remove();
  });
}

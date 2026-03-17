import api from '../services/api';

const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('url');

const titleEl = document.getElementById('title');
const messageEl = document.getElementById('message');
const urlDisplayEl = document.getElementById('url-display');
const loaderContainer = document.getElementById('loader-container');
const cancelBtn = document.getElementById('cancel-btn');
const modal = document.getElementById('modal');

if (!targetUrl) {
    window.close();
} else {
    urlDisplayEl.textContent = new URL(targetUrl).hostname;
    startAnalysis();
}

async function startAnalysis() {
    try {
        const result = await api.analyzeURL(targetUrl);
        
        if (result.classification === 'High Risk') {
            showDetection(result);
        } else {
            // Safe! Redirect to destination
            window.location.href = targetUrl;
        }
    } catch (error) {
        console.error('Analysis failed:', error);
        // On error, let the user proceed but maybe show a small warning
        window.location.href = targetUrl;
    }
}

function showDetection(data) {
    modal.classList.add('danger');
    loaderContainer.style.display = 'none';
    
    titleEl.textContent = 'Security Alert';
    messageEl.textContent = `Potential risks detected on this site. We recommend you don't proceed.`;
    
    const reasonHtml = `
        <div class="reason-box">
            <div style="font-weight: 600; font-size: 14px; color: white;">AI Findings:</div>
            <ul class="reason-list">
                ${data.reasons.map(r => `<li style="margin-top: 4px;">• ${r.text}</li>`).join('')}
            </ul>
        </div>
        <button class="btn btn-red" id="back-btn">Return to Safety</button>
        <button class="btn" id="proceed-btn" style="background: transparent; border: none; font-size: 12px; margin-top: 10px; text-decoration: underline;">I understand the risk, proceed anyway</button>
    `;
    
    const content = document.getElementById('content');
    content.innerHTML = reasonHtml;
    
    document.getElementById('back-btn').onclick = () => {
        window.history.back();
        // If no history, close
        setTimeout(() => window.close(), 100);
    };
    
    document.getElementById('proceed-btn').onclick = () => {
        // Add to bypass list to prevent infinite loop when extension storage is available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['bypassedUrls'], (result) => {
                const bypassedUrls = result.bypassedUrls || [];
                if (!bypassedUrls.includes(targetUrl)) {
                    bypassedUrls.push(targetUrl);
                    chrome.storage.local.set({ bypassedUrls });
                }
                window.location.href = targetUrl;
            });
        } else {
            // Fallback when running outside an extension context: just redirect
            window.location.href = targetUrl;
        }
    };
}

cancelBtn.onclick = () => {
    window.history.back();
    setTimeout(() => window.close(), 100);
};

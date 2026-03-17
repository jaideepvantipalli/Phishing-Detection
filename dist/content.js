var e=window.jsQR;function t(e,t){try{chrome.runtime&&chrome.runtime.id&&chrome.runtime.sendMessage(e,e=>{chrome.runtime.lastError||t&&t(e)})}catch{}}chrome.runtime.onMessage.addListener((e,t,n)=>{e.action===`SHOW_WARNING`&&s(e.data)});var n=new Set,r=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&e.target.tagName===`IMG`&&a(e.target)})},{threshold:.1}),i=new MutationObserver(e=>{e.forEach(e=>{e.addedNodes.forEach(e=>{e.tagName===`IMG`&&r.observe(e),e.querySelectorAll&&e.querySelectorAll(`img`).forEach(e=>r.observe(e))})})});document.body&&(i.observe(document.body,{childList:!0,subtree:!0}),document.querySelectorAll(`img`).forEach(e=>r.observe(e)));async function a(r){if(!(n.has(r.src)||!r.complete||r.naturalWidth===0)){n.add(r.src);try{let n=document.createElement(`canvas`),i=n.getContext(`2d`);n.width=r.naturalWidth,n.height=r.naturalHeight,i.drawImage(r,0,0);let a=i.getImageData(0,0,n.width,n.height),s=e(a.data,a.width,a.height);if(s&&s.data){let e=s.data;e.startsWith(`http`)&&t({action:`ANALYZE_LINK`,url:e},t=>{t&&t.classification===`High Risk`&&o(r,e,t)})}}catch{}}}function o(e,t,n){let r=e.getBoundingClientRect(),i=document.createElement(`div`);i.className=`phishguard-qr-alert`,i.style.cssText=`
    position: absolute;
    top: ${r.top+window.scrollY}px;
    left: ${r.left+window.scrollX}px;
    width: ${r.width}px;
    height: ${r.height}px;
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
  `,i.innerHTML=`⚠️ Malicious QR Detected! Click to view details.`,i.onclick=()=>{try{chrome.runtime&&chrome.runtime.id&&(window.location.href=chrome.runtime.getURL(`verify.html?url=${encodeURIComponent(t)}`))}catch{}},document.body.appendChild(i)}function s(e){if(document.getElementById(`phishguard-warning-banner`))return;let t=document.createElement(`div`);t.id=`phishguard-warning-banner`,t.style.cssText=`
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
  `,t.innerHTML=`
    <span>⚠️ <strong>PhishGuard AI Alert:</strong> This site has a high risk score of ${e.riskScore}%. Proceed with caution!</span>
    <button id="phishguard-dismiss" style="background: white; color: #ef4444; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">Dismiss</button>
  `,document.body.prepend(t),document.getElementById(`phishguard-dismiss`).addEventListener(`click`,()=>t.remove())}
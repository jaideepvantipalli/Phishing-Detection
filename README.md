# PhishGuard AI - Ultimate Browser Security Extension

![PhishGuard Banner](https://img.shields.io/badge/Security-AI--Powered-00ff88?style=for-the-badge&logo=shield)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange?style=for-the-badge&logo=googlechrome)
![Groq AI](https://img.shields.io/badge/AI-Groq--Llama3-A100FF?style=for-the-badge)

**PhishGuard AI** is a cutting-edge browser extension designed to protect your digital life in real-time. By combining the power of **Groq-accelerated AI (Llama 3)** with advanced heuristic scanning, it provides a comprehensive shield against phishing, malicious redirects, and "Quishing" (QR Code Phishing).

---

## 🛡️ Core Security Features

### 1. 🚀 Real-Time Link Protection
Intercepts suspicious links **before** you land on the page. PhishGuard analyzes the destination URL using AI and displays a dedicated verification barrier if threats are detected.

### 2. 🔄 Deep Redirect Analysis
Attackers often hide malicious sites behind multiple redirects (like bit.ly or tinyurl). PhishGuard follows the entire chain to the final destination and performs analysis on the actual landing page.

### 3. 📸 Quishing (QR Phishing) Protection
Phishing is moving to QR codes. PhishGuard automatically scans all QR codes visible on a webpage, analyzes the encoded URLs with AI, and warns you if the QR is a "trap" without you ever needing to pick up your phone.

### 4. 🧠 Groq-Powered AI Engine
Uses the latest Llama 3 models on Groq's high-speed inference engine for near-instant analysis of URLs, emails, and suspicious text content.

### 5. 💬 Security Expert Chatbot
Have a security question? Chat with our integrated AI assistant to get expert advice on phishing trends, social engineering, and online safety.

### 6. 📊 Interactive Dashboard
A stunning, cybersecurity-themed control center to monitor your stats, view your scan history, and configure your protection sensitivity.

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite 8 (Modern ES Modules)
- **AI Engine**: Groq API (Llama 3 Series)
- **Scanning Libs**: `jsQR` (Client-side QR decoding)
- **Styling**: Tailwind CSS 4 + Cyber-Dark Custom Theme
- **extension API**: Manifest V3 (Service Workers & Content Scripts)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (Latest LTS)
- A **Groq API Key** (Get one at [console.groq.com](https://console.groq.com/))

### 2. Installation & Setup
1. Clone the repository:
   ```bash
   git clone git@github.com:KomeshBathula/Phishing-Detection.git
   cd phishing-detection-website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
4. Build the extension:
   ```bash
   npm run build
   ```

### 3. Loading in Chrome
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked**.
4. Select the `dist` folder created after the build.

---

## 🏗 Project Architecture

```text
├── ml/                  # Machine Learning Research & Training
│   ├── train.py         # Model training script (Random Forest)
│   ├── requirements.txt # Python dependencies for ML
│   ├── data/            # training dataset (malicious_phish.csv)
│   └── models/          # Saved model (phishing_model.pkl)
├── src/                 # Extension source code
```

---

## 🔒 Security & Privacy
PhishGuard AI follows a **Zero-Server** philosophy for history. All your scan reports and stats are stored strictly within your browser's local storage (`chrome.storage`). Analysis is performed via encrypted API calls to Groq.

---

Developed with ❤️ by the PhishGuard Team.

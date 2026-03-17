# PhishGuard AI - Modern Phishing Detection & Prevention

![PhishGuard Banner](https://img.shields.io/badge/Security-AI--Powered-00ff88?style=for-the-badge&logo=shield)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS%204-06B6D4?style=for-the-badge&logo=tailwindcss)

PhishGuard AI is a production-level cybersecurity platform designed to protect users from phishing threats through advanced AI analysis and interactive training. Unlike basic detection tools, PhishGuard focuses on **Explainability**—teaching users *why* something is dangerous so they can develop deep cybersecurity intuition.

## 🚀 Key Features

- **🧠 AI-Powered Analyzer**: Real-time analysis of URLs, Emails, and SMS messages using advanced heuristic models.
- **🔍 Explainability UI**: Detailed breakdown of threat markers with interactive tooltips and "Why This Matters" insights.
- **🎮 Phishing Simulations**: Gamified training scenarios to help users identify real-world attack vectors.
- **📜 Scan History**: Persistent local history of all analyzed content with detailed risk reports.
- **⚙️ Advanced Settings**: Configure AI sensitivity, data retention, and privacy protocols.
- **💎 Premium Dashboard**: Stunning cybersecurity-themed UI with glassmorphism, pulse animations, and grid-based layouts.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8
- **Styling**: Tailwind CSS 4 (Vanilla CSS variables)
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Design System**: Custom Cyber-Dark Design System with Glassmorphism

## 📦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:KomeshBathula/Phishing-Detection.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

```text
src/
 ├── components/       # Reusable UI components (Card, Button, Navbar, etc.)
 ├── data/             # Mock data and scenario definitions
 ├── pages/            # Main application pages (Dashboard, Analyzer, etc.)
 ├── utils/            # Helper functions and analysis logic
 ├── App.jsx           # Main routing and layout wrapper
 └── main.jsx          # Application entry point
```

## 🛡 Security First

PhishGuard AI follows a **Zero-Trust** philosophy. All analysis results and history are stored locally in the browser. We do not transmit sensitive analyzed content to external servers in this demo implementation.

---

Developed with ❤️ by the PhishGuard Team.

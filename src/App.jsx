import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Simulation from './pages/Simulation';
import History from './pages/History';
import Settings from './pages/Settings';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text selection:bg-cyber-accent/30 selection:text-white">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyber-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyber-info/5 rounded-full blur-[120px]" />
      </div>

      <ScrollToTop />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyzer" element={<Analyzer />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className="py-8 border-t border-cyber-border mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent" />
                <span className="text-xs font-mono tracking-wider">SECURE_ENVIRONMENT_V1.4.2</span>
              </div>
              <p className="text-xs text-cyber-muted text-center font-medium">
                © 2026 PhishGuard AI. Advanced Phishing Detection & Human Intelligence Training.
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-cyber-muted">
                <a href="#" className="hover:text-cyber-accent transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-cyber-accent transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

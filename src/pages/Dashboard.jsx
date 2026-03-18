import { useNavigate } from 'react-router-dom';
import {
  Shield, Scan, AlertTriangle, CheckCircle, Target,
  ArrowRight, Link2, Mail, MessageSquare, TrendingUp,
  Zap, Eye, Brain, ChevronRight,
} from 'lucide-react';
import Card from '../components/Card';
import RiskBadge from '../components/RiskBadge';
import Button from '../components/Button';
import { formatTimestamp } from '../utils/analyzer';
import api from '../services/api';
import { useEffect, useState } from 'react';

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <Card hover className={`animate-fade-in-up stagger-${delay}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-cyber-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-white font-mono">{value}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl bg-cyber-darker/50 border border-cyber-border/50 hover:border-cyber-accent/20 transition-all duration-300 animate-fade-in-up stagger-${delay}`}>
      <div className="p-2 rounded-lg bg-cyber-accent/10 flex-shrink-0">
        <Icon className="w-5 h-5 text-cyber-accent" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
        <p className="text-xs text-cyber-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

const typeIcons = {
  url: Link2,
  email: Mail,
  text: MessageSquare,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, historyData] = await Promise.all([
          api.getStats(),
          api.getHistory()
        ]);
        setStats(statsData);
        setRecentItems((historyData || []).slice(0, 5));
      } catch (err) {
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-cyber-border bg-gradient-to-br from-cyber-card via-cyber-darker to-cyber-card p-10 md:p-16 group">
        {/* Animated background highlights */}
        <div className="absolute inset-0 grid-bg opacity-30 group-hover:opacity-40 transition-opacity duration-700" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyber-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyber-info/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        
        {/* Scan line animation overlay */}
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-accent/30 to-transparent top-0 animate-scan-line opacity-50" />

        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
            <div className="relative">
              <span className="absolute inset-0 bg-cyber-accent/20 blur-md rounded-full animate-pulse" />
              <Shield className="w-5 h-5 text-cyber-accent relative" />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20 rounded-full">
                Neural Engine Active
              </span>
              <span className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-cyber-info/10 text-cyber-info border border-cyber-info/20 rounded-full">
                Zero-Trust Protocol
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] animate-fade-in-up stagger-1">
            Secure Your Digital
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-accent via-white to-cyber-info">
              Frontline with AI
            </span>
          </h1>

          <p className="text-xl text-cyber-muted mb-10 max-w-2xl leading-relaxed animate-fade-in-up stagger-2">
            The next generation of phishing detection. We don't just alert you to threats — 
            we decode the <span className="text-cyber-accent font-semibold italic">psychology</span> behind the attack to keep you one step ahead.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
            <Button
              size="lg"
              icon={Scan}
              onClick={() => navigate('/analyzer')}
              className="px-8 shadow-[0_0_30px_rgba(0,255,136,0.2)]"
            >
              Initialize Scanner
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={Brain}
              onClick={() => navigate('/simulation')}
              className="px-8"
            >
              Enterprise Training
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Scan} 
            label="Total Scans" 
            value={loading ? '...' : (stats?.totalScans || 0).toLocaleString()} 
            color="#3b82f6" 
            delay={1} 
          />
          <StatCard 
            icon={AlertTriangle} 
            label="Threats Detected" 
            value={loading ? '...' : (stats?.threatsDetected || 0).toLocaleString()} 
            color="#ef4444" 
            delay={2} 
          />
          <StatCard 
            icon={CheckCircle} 
            label="Safe Content" 
            value={loading ? '...' : (stats?.safeContent || 0).toLocaleString()} 
            color="#22c55e" 
            delay={3} 
          />
          <StatCard 
            icon={Target} 
            label="Detection Accuracy" 
            value={loading ? '...' : `${stats?.accuracy || 0}%`} 
            color="#00ff88" 
            delay={4} 
          />
        </div>
      </section>

      {/* Features + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Features */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyber-accent" />
            Key Capabilities
          </h2>
          <div className="space-y-3">
            <FeatureCard
              icon={Scan}
              title="Multi-Format Analysis"
              description="Analyze URLs, emails, and text messages for phishing threats with our advanced detection engine."
              delay={1}
            />
            <FeatureCard
              icon={Eye}
              title="Explainable AI"
              description="Understand exactly why content is flagged as dangerous with detailed, human-readable explanations."
              delay={2}
            />
            <FeatureCard
              icon={Brain}
              title="Security Training"
              description="Sharpen your phishing detection skills with interactive simulations using real-world scenarios."
              delay={3}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Threat Intelligence"
              description="Powered by continuously updated threat databases and pattern recognition algorithms."
              delay={4}
            />
          </div>

          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mt-8">
            <AlertTriangle className="w-5 h-5 text-cyber-danger" />
            Top Threats Prevented
          </h2>
          <Card className="mt-4 border-cyber-danger/20 bg-cyber-danger/5">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-cyber-text">Homograph Attacks</span>
                <span className="text-cyber-danger font-mono font-bold">142</span>
              </div>
              <div className="h-1 bg-cyber-darker rounded-full overflow-hidden">
                <div className="h-full bg-cyber-danger w-[75%]" />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-cyber-text">Credential Harvesters</span>
                <span className="text-cyber-danger font-mono font-bold">89</span>
              </div>
              <div className="h-1 bg-cyber-darker rounded-full overflow-hidden">
                <div className="h-full bg-cyber-danger w-[55%]" />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-cyber-text">Malicious QR Codes</span>
                <span className="text-cyber-danger font-mono font-bold">34</span>
              </div>
              <div className="h-1 bg-cyber-darker rounded-full overflow-hidden">
                <div className="h-full bg-cyber-danger w-[30%]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyber-info" />
              Recent Activity
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-cyber-muted hover:text-cyber-accent transition-colors flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Card>
            <div className="space-y-1">
              {recentItems.map((item, i) => {
                const TypeIcon = typeIcons[item.type] || Link2;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-cyber-darker/50 transition-colors cursor-pointer animate-fade-in-up stagger-${i + 1}`}
                    onClick={() => navigate('/history')}
                  >
                    <div className="p-2 rounded-lg bg-cyber-darker">
                      <TypeIcon className="w-4 h-4 text-cyber-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cyber-text truncate font-mono">
                        {item.input}
                      </p>
                      <p className="text-xs text-cyber-muted mt-0.5">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                    <RiskBadge classification={item.classification} size="sm" />
                    <ChevronRight className="w-4 h-4 text-cyber-border" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

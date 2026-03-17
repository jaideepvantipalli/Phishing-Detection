import { useState } from 'react';
import {
  Clock, Link2, Mail, MessageSquare, Search,
  ChevronRight, Trash2, Filter,
} from 'lucide-react';
import Card from '../components/Card';
import RiskBadge from '../components/RiskBadge';
import ProgressCircle from '../components/ProgressCircle';
import Modal from '../components/Modal';
import ExplainabilityPanel from '../components/ExplainabilityPanel';
import { formatTimestamp } from '../utils/analyzer';
import { mockAnalysisResults } from '../data/mockData';
import api from '../services/api';
import { useEffect } from 'react';

const typeIcons = {
  url: Link2,
  email: Mail,
  text: MessageSquare,
};

const typeColors = {
  url: 'text-cyber-info',
  email: 'text-cyber-accent',
  text: 'text-cyber-warning',
};

function getDetailedResult(item) {
  // If the item already has reasons (saved from a real scan), use them
  if (item.reasons && item.reasons.length > 0) return item;

  const results = mockAnalysisResults[item.type];
  if (!results) return null;

  if (item.riskScore > 70) return results.high || Object.values(results)[0];
  if (item.riskScore > 30) return results.medium || results.high || Object.values(results)[0];
  return results.low || Object.values(results)[0];
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await api.getHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load scan history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery && !item.input.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const detailedResult = selectedItem ? getDetailedResult(selectedItem) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyber-accent/10">
            <Clock className="w-6 h-6 text-cyber-accent" />
          </div>
          Scan History
        </h1>
        <p className="text-cyber-muted mt-1 ml-14">
          Review your previous threat analysis results
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-cyber-darker border border-cyber-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-cyber-text placeholder:text-cyber-muted/50 focus:outline-none focus:ring-2 focus:ring-cyber-accent/50 focus:border-cyber-accent/50 transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-1 p-1 bg-cyber-darker rounded-lg">
            {[
              { id: 'all', label: 'All', icon: Filter },
              { id: 'url', label: 'URL', icon: Link2 },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'text', label: 'Text', icon: MessageSquare },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  filter === f.id
                    ? 'bg-cyber-card text-cyber-accent'
                    : 'text-cyber-muted hover:text-cyber-text'
                }`}
              >
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading & Error States */}
      {loading && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin-slow" />
            <p className="text-cyber-muted text-sm font-mono">RETRIEVING_DATA_LOGS...</p>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="text-center py-12 border-cyber-danger/20">
          <p className="text-cyber-danger text-sm font-medium">{error}</p>
        </Card>
      )}

      {/* History list */}
      <div className="space-y-2">
        {filteredHistory.length === 0 ? (
          <Card className="text-center py-12">
            <Search className="w-8 h-8 text-cyber-muted mx-auto mb-3" />
            <p className="text-cyber-muted">No results found</p>
          </Card>
        ) : (
          filteredHistory.map((item, i) => {
            const TypeIcon = typeIcons[item.type] || Link2;
            const typeColor = typeColors[item.type] || 'text-cyber-muted';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`flex items-center gap-4 p-4 rounded-xl bg-cyber-card/80 border border-cyber-border hover:border-cyber-accent/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.03)] cursor-pointer transition-all duration-200 animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Type icon */}
                <div className={`p-2.5 rounded-xl bg-cyber-darker ${typeColor}`}>
                  <TypeIcon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cyber-text truncate font-mono">{item.input}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-cyber-muted capitalize">{item.type}</span>
                    <span className="text-xs text-cyber-border">|</span>
                    <span className="text-xs text-cyber-muted">{formatTimestamp(item.timestamp)}</span>
                  </div>
                </div>

                {/* Risk */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold font-mono ${
                        item.riskScore > 70
                          ? 'text-cyber-danger'
                          : item.riskScore > 30
                          ? 'text-cyber-warning'
                          : 'text-cyber-safe'
                      }`}
                    >
                      {item.riskScore}
                    </span>
                  </div>
                  <RiskBadge classification={item.classification} size="sm" />
                </div>

                <ChevronRight className="w-4 h-4 text-cyber-border flex-shrink-0" />
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Analysis Report"
        size="lg"
      >
        {selectedItem && detailedResult && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-6">
              <ProgressCircle score={selectedItem.riskScore} size={100} strokeWidth={8} animate={false} />
              <div className="flex-1">
                <RiskBadge classification={selectedItem.classification} size="lg" />
                <p className="text-sm text-cyber-muted mt-2 font-mono truncate">
                  {selectedItem.input}
                </p>
                <p className="text-xs text-cyber-muted mt-1">
                  Analyzed {formatTimestamp(selectedItem.timestamp)}
                </p>
              </div>
            </div>

            <div className="border-t border-cyber-border pt-4">
              <ExplainabilityPanel result={detailedResult} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

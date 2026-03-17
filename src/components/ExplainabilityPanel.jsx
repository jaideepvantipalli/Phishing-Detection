import { AlertTriangle, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import { getSeverityColor } from '../utils/analyzer';

function HighlightedContent({ content }) {
  if (!content || content.length === 0) return null;

  return (
    <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap bg-cyber-darker rounded-lg p-4 border border-cyber-border">
      {content.map((segment, i) => {
        if (segment.type === 'normal') {
          return <span key={i} className="text-cyber-text">{segment.text}</span>;
        }

        if (segment.type === 'safe') {
          return (
            <span key={i} className="text-cyber-safe">
              {segment.text}
            </span>
          );
        }

        const colorClass =
          segment.type === 'danger'
            ? 'bg-cyber-danger/20 text-cyber-danger border-b-2 border-cyber-danger'
            : 'bg-cyber-warning/20 text-cyber-warning border-b-2 border-cyber-warning';

        return (
          <span key={i} className="relative group inline">
            <span className={`${colorClass} rounded px-0.5 cursor-help`}>
              {segment.text}
            </span>
            {segment.tooltip && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-cyber-darker border border-cyber-border rounded-lg text-xs text-cyber-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl max-w-xs whitespace-normal">
                <span className="flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-cyber-warning mt-0.5 flex-shrink-0" />
                  {segment.tooltip}
                </span>
                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-cyber-border" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function ReasonsList({ reasons }) {
  const severityIcons = {
    critical: ShieldAlert,
    high: AlertTriangle,
    medium: Info,
    low: Info,
    safe: CheckCircle,
  };

  return (
    <div className="space-y-3">
      {reasons.map((reason, i) => {
        const Icon = severityIcons[reason.severity] || Info;
        const color = getSeverityColor(reason.severity);

        return (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg bg-cyber-darker/50 border border-cyber-border/50 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              className="p-1.5 rounded-md mt-0.5 flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-cyber-text leading-relaxed">
                {reason.keyword ? (
                  highlightKeyword(reason.text, reason.keyword, color)
                ) : (
                  reason.text
                )}
              </p>
            </div>
            <span
              className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
            >
              {reason.severity}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function highlightKeyword(text, keyword, color) {
  if (!keyword) return text;
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + keyword.length);
  const after = text.slice(index + keyword.length);

  return (
    <>
      {before}
      <span
        className="font-semibold px-1 rounded"
        style={{ color, backgroundColor: `${color}20` }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

function UrlBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const items = [
    { label: 'Protocol', value: breakdown.protocol, safe: breakdown.ssl },
    { label: 'Domain', value: breakdown.domain, safe: false },
    { label: 'Path', value: breakdown.path, safe: true },
    { label: 'SSL Certificate', value: breakdown.ssl ? 'Valid' : 'Not Present', safe: breakdown.ssl },
    { label: 'Domain Age', value: breakdown.domainAge, safe: parseInt(breakdown.domainAge) > 365 },
    { label: 'Registrar', value: breakdown.registrar, safe: breakdown.registrar !== 'Unknown Registrar' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-cyber-darker/50 border border-cyber-border/50"
          >
            <span className="text-xs text-cyber-muted uppercase tracking-wider">{item.label}</span>
            <span
              className={`text-sm font-mono ${
                item.safe ? 'text-cyber-safe' : 'text-cyber-danger'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {breakdown.suspiciousPatterns && breakdown.suspiciousPatterns.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-cyber-warning mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Suspicious Patterns Detected
          </h4>
          <ul className="space-y-2">
            {breakdown.suspiciousPatterns.map((pattern, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-cyber-text pl-3 border-l-2 border-cyber-warning/50"
              >
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WhyThisMatters({ classification }) {
  const content = {
    'High Risk': {
      title: 'Why This Matters',
      description:
        'This content exhibits multiple indicators consistent with phishing attacks. Attackers use these techniques to steal credentials, financial information, and personal data. If you received this in real life:',
      actions: [
        'Do NOT click any links or download attachments',
        'Do NOT reply with personal information',
        'Report the content to your IT/security team',
        'Verify through official channels if concerned about your account',
      ],
    },
    'Medium Risk': {
      title: 'Why This Matters',
      description:
        'This content shows some suspicious indicators but isn\'t definitively malicious. Proceed with caution:',
      actions: [
        'Verify the sender through official channels',
        'Don\'t click links — navigate to the website directly',
        'Look for additional red flags before interacting',
        'When in doubt, report it to your security team',
      ],
    },
    'Low Risk': {
      title: 'Analysis Summary',
      description:
        'This content appears legitimate based on our analysis. However, always maintain good security practices:',
      actions: [
        'Continue to verify unexpected communications',
        'Keep your security software updated',
        'Report anything that feels suspicious',
      ],
    },
  };

  const c = content[classification] || content['Medium Risk'];
  const isHighRisk = classification === 'High Risk';

  return (
    <div
      className={`rounded-lg p-4 border ${
        isHighRisk
          ? 'bg-cyber-danger/5 border-cyber-danger/20'
          : classification === 'Medium Risk'
          ? 'bg-cyber-warning/5 border-cyber-warning/20'
          : 'bg-cyber-safe/5 border-cyber-safe/20'
      }`}
    >
      <h4
        className={`text-sm font-semibold mb-2 ${
          isHighRisk ? 'text-cyber-danger' : classification === 'Medium Risk' ? 'text-cyber-warning' : 'text-cyber-safe'
        }`}
      >
        {c.title}
      </h4>
      <p className="text-sm text-cyber-muted mb-3">{c.description}</p>
      <ul className="space-y-1.5">
        {c.actions.map((action, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-cyber-text">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isHighRisk ? 'bg-cyber-danger' : classification === 'Medium Risk' ? 'bg-cyber-warning' : 'bg-cyber-safe'
              }`}
            />
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ExplainabilityPanel({ result }) {
  if (!result) return null;

  return (
    <div className="space-y-6">
      {/* Highlighted Content */}
      {result.highlightedContent && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyber-accent rounded-full" />
            Content Analysis
            <span className="text-xs text-cyber-muted font-normal">(hover highlighted text for details)</span>
          </h3>
          <HighlightedContent content={result.highlightedContent} />
        </div>
      )}

      {/* Reasons */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-cyber-info rounded-full" />
          Detection Findings
        </h3>
        <ReasonsList reasons={result.reasons} />
      </div>

      {/* URL Breakdown */}
      {result.urlBreakdown && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-cyber-warning rounded-full" />
            URL Breakdown
          </h3>
          <UrlBreakdown breakdown={result.urlBreakdown} />
        </div>
      )}

      {/* Why This Matters */}
      <WhyThisMatters classification={result.classification} />
    </div>
  );
}

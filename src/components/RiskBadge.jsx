import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function RiskBadge({ classification, size = 'md' }) {
  const config = {
    'Low Risk': {
      icon: ShieldCheck,
      bg: 'bg-cyber-safe/10',
      border: 'border-cyber-safe/30',
      text: 'text-cyber-safe',
      glow: 'shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    },
    'Medium Risk': {
      icon: AlertTriangle,
      bg: 'bg-cyber-warning/10',
      border: 'border-cyber-warning/30',
      text: 'text-cyber-warning',
      glow: 'shadow-[0_0_10px_rgba(251,191,36,0.2)]',
    },
    'High Risk': {
      icon: ShieldAlert,
      bg: 'bg-cyber-danger/10',
      border: 'border-cyber-danger/30',
      text: 'text-cyber-danger',
      glow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    },
  };

  const c = config[classification] || config['Medium Risk'];
  const Icon = c.icon;

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${c.bg} ${c.border} ${c.text} ${c.glow} ${sizes[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {classification}
    </span>
  );
}

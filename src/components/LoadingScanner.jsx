import { Shield, ScanSearch } from 'lucide-react';

export default function LoadingScanner({ type = 'url' }) {
  const messages = [
    'Initializing AI engine...',
    'Scanning for suspicious patterns...',
    'Checking domain reputation...',
    'Analyzing content semantics...',
    'Cross-referencing threat database...',
    'Generating risk assessment...',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Animated scanner */}
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyber-accent/20 animate-spin-slow" />
        {/* Middle ring */}
        <div
          className="absolute inset-3 rounded-full border-2 border-dashed border-cyber-info/30"
          style={{ animation: 'spin-slow 4s linear infinite reverse' }}
        />
        {/* Inner shield */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Shield className="w-12 h-12 text-cyber-accent animate-pulse" />
            <ScanSearch className="absolute -bottom-1 -right-1 w-5 h-5 text-cyber-info" />
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-cyber-accent/5 animate-pulse" />
      </div>

      {/* Scanning messages */}
      <div className="space-y-3 text-center">
        <h3 className="text-lg font-semibold text-white">Analyzing {type}...</h3>
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm text-cyber-muted animate-fade-in-up"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent animate-pulse" />
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-cyber-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyber-accent to-cyber-info rounded-full animate-shimmer"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

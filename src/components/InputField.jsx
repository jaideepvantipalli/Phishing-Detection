import { AlertCircle } from 'lucide-react';

export default function InputField({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  multiline = false,
  rows = 4,
  icon: Icon,
  className = '',
}) {
  const baseClass = `
    w-full bg-cyber-darker border rounded-lg px-4 py-3 text-cyber-text
    placeholder:text-cyber-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-1
    focus:ring-offset-cyber-dark transition-all duration-200 font-mono text-sm
    ${error ? 'border-cyber-danger focus:ring-cyber-danger' : 'border-cyber-border focus:ring-cyber-accent/50 focus:border-cyber-accent/50'}
  `;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-cyber-text">{label}</label>
      )}
      <div className="relative">
        {Icon && !multiline && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`${baseClass} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseClass} ${Icon ? 'pl-10' : ''}`}
          />
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-cyber-danger">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

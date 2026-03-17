export default function Card({ children, className = '', hover = false, glow = false }) {
  return (
    <div
      className={`
        bg-cyber-card/80 backdrop-blur-sm border border-cyber-border rounded-xl p-6
        transition-all duration-300
        ${hover ? 'hover:border-cyber-accent/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.05)]' : ''}
        ${glow ? 'shadow-[0_0_20px_rgba(0,255,136,0.1)] border-cyber-accent/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

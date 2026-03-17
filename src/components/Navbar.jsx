import { NavLink, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Search, Gamepad2, Clock, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyzer', label: 'Analyzer', icon: Search },
  { to: '/simulation', label: 'Simulation', icon: Gamepad2 },
  { to: '/history', label: 'History', icon: Clock },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-cyber-darker/80 backdrop-blur-xl border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyber-accent transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyber-accent rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">
                PhishGuard
              </span>
              <span className="text-[10px] font-medium text-cyber-accent tracking-widest uppercase leading-none mt-0.5">
                AI Powered
              </span>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyber-accent/10 text-cyber-accent border border-cyber-accent/20'
                      : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-cyber-muted">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyber-safe/10 border border-cyber-safe/20 text-cyber-safe">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-safe animate-pulse" />
              System Active
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-cyber-muted hover:text-cyber-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cyber-border bg-cyber-darker/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyber-accent/10 text-cyber-accent'
                      : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

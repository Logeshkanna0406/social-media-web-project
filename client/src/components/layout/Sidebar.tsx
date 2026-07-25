import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, MessageSquare, Bot, BarChart3, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Feed Stream', path: '/feed', icon: <Home className="w-4 h-4" /> },
    { label: 'AI Workspace', path: '/ai-hub', icon: <Bot className="w-4 h-4 text-purple-400" />, badge: 'AI' },
    { label: 'Jobs & Recruiting', path: '/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Channels & Chat', path: '/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Network & People', path: '/networking', icon: <Users className="w-4 h-4" /> },
    { label: 'Platform Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Dashboard', path: '/admin', icon: <ShieldAlert className="w-4 h-4 text-amber-400" />, badge: 'Admin' });
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-6rem)]">
      <div className="glass-panel rounded-2xl p-4 border border-white/10 h-full flex flex-col justify-between">
        {/* Profile Summary Header */}
        <div>
          {user && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 mb-4 flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={user.fullName}
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-indigo-500/50"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-100 truncate">{user.fullName}</span>
                <span className="text-[11px] text-slate-400 truncate">{user.headline || 'Professional'}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-600/10'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && <Badge variant="brand" size="sm">{item.badge}</Badge>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* AI Assistant Quick Widget */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-500/30 text-center flex flex-col gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <h4 className="text-xs font-bold text-slate-100">AI Career Copilot</h4>
          <p className="text-[11px] text-slate-400">Scan your resume & generate tech captions automatically.</p>
        </div>
      </div>
    </aside>
  );
};

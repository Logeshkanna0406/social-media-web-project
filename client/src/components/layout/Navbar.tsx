import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, Sun, Moon, LogOut, User as UserIcon, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              ConnectHub <span className="text-indigo-400 font-black">AI</span>
            </span>
            <span className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-semibold -mt-1">
              Professional Network
            </span>
          </div>
        </Link>

        {/* Global Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search engineers, AI skills, jobs, topics..."
            className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/networking');
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <>
              <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors border border-white/10"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/50"
                  />
                  <span className="hidden sm:inline-block text-sm font-semibold text-slate-200 max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl p-2 border border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-slate-200">{user.fullName}</p>
                      <p className="text-[11px] text-indigo-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-600/20 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      My Profile
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-indigo-600/20 rounded-xl transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-400" />
                        Admin Portal
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="gradient" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

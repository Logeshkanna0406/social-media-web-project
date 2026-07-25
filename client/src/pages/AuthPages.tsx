import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@connecthub.ai');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addToast('success', 'Welcome Back!', 'Logged in successfully to ConnectHub AI.');
      navigate('/feed');
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'USER' | 'ADMIN') => {
    setIsLoading(true);
    try {
      const demoEmail = role === 'ADMIN' ? 'admin@connecthub.ai' : 'demo@connecthub.ai';
      await login(demoEmail, 'Password123!');
      addToast('success', `Signed in as ${role}`);
      navigate('/feed');
    } catch (err) {
      addToast('error', 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <GlassCard className="w-full max-w-md p-8 border border-white/10 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to ConnectHub AI</h2>
          <p className="text-xs text-slate-400 mt-1">Access your AI resume tools and professional network</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button variant="gradient" size="md" isLoading={isLoading} type="submit" className="w-full mt-2">
            Sign In
          </Button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">Quick Demo Access</span>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleDemoLogin('USER')}>
              Demo Candidate
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleDemoLogin('ADMIN')}>
              Demo Admin
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'RECRUITER'>('USER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({ email, password, fullName, role });
      addToast('success', 'Account Created!', 'Welcome to ConnectHub AI.');
      navigate('/feed');
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      <GlassCard className="w-full max-w-md p-8 border border-white/10">
        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="text-2xl font-extrabold text-white">Join ConnectHub AI</h2>
          <p className="text-xs text-slate-400 mt-1">Create your AI-enhanced tech profile</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<UserIcon className="w-4 h-4" />}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-300">I am joining as a</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  role === 'USER' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'border-white/10 text-slate-400'
                }`}
              >
                Candidate / Engineer
              </button>
              <button
                type="button"
                onClick={() => setRole('RECRUITER')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  role === 'RECRUITER' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'border-white/10 text-slate-400'
                }`}
              >
                Recruiter / Employer
              </button>
            </div>
          </div>

          <Button variant="gradient" size="md" isLoading={isLoading} type="submit" className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
};

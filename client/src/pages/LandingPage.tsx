import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Bot, Users, Briefcase, MessageSquare, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Hero Glow Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-8"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>The Next-Generation AI Professional Network</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.15]"
        >
          Elevate Your Tech Career With{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Precision & Real-Time Connections
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl leading-relaxed"
        >
          ConnectHub AI blends the networking power of LinkedIn, the real-time discourse of Twitter, and Discord-style developer channels—powered by built-in AI Resume Analysis & Smart Job Matching.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/register">
            <Button variant="gradient" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Free Account
            </Button>
          </Link>
          <Link to="/feed">
            <Button variant="secondary" size="lg">
              Explore Live Feed
            </Button>
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <GlassCard hoverEffect>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Career Copilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant ATS resume scoring, AI bio generator, viral post composition, and targeted skill roadmaps based on live hiring demands.
            </p>
          </GlassCard>

          <GlassCard hoverEffect>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Discord-Style Channels</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engage in niche developer hubs (#react-architects, #ai-engineers, #devops) with real-time Socket.io typing indicators and media sharing.
            </p>
          </GlassCard>

          <GlassCard hoverEffect>
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Recruiter Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Apply with 1-click verified resumes. Recruiters get automated applicant tracking, analytics dashboards, and candidate match scores.
            </p>
          </GlassCard>
        </div>

        {/* Interactive Stats Banner */}
        <div className="mt-20 w-full glass-panel rounded-3xl p-8 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-3xl font-extrabold text-white">15,000+</h3>
            <p className="text-xs text-slate-400 mt-1">Active Tech Professionals</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-indigo-400">98.4%</h3>
            <p className="text-xs text-slate-400 mt-1">AI Resume Accuracy</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-purple-400">3,400+</h3>
            <p className="text-xs text-slate-400 mt-1">Verified Job Opportunities</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-pink-400">4.9 / 5.0</h3>
            <p className="text-xs text-slate-400 mt-1">Platform Rating</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© 2026 ConnectHub AI Inc. Engineered with React, TypeScript, Express & Gemini AI.</p>
      </footer>
    </div>
  );
};

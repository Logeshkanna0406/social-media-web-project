import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { ResumeAnalyzerModal } from '../components/ai/ResumeAnalyzerModal';
import { BioGeneratorModal } from '../components/ai/BioGeneratorModal';
import { Sparkles, Bot, FileText, UserCheck, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

export const AIHubPage: React.FC = () => {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Banner */}
      <GlassCard className="bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-pink-900/40 p-8 border border-indigo-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">ConnectHub AI Career Suite</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Leverage our proprietary Gemini 1.5 & OpenAI multi-agent intelligence suite to score your resume against ATS screeners, generate viral technical captions, and discover strategic skill upgrade paths.
        </p>
      </GlassCard>

      {/* Grid of AI Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard hoverEffect>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">AI Resume Review & ATS Scorer</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Scans your resume for quantifiable metrics, tech stack keywords, and bullet point impact before recruiters review your profile.
          </p>
          <Button variant="gradient" size="sm" onClick={() => setIsResumeModalOpen(true)} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Launch Resume Scorer
          </Button>
        </GlassCard>

        <GlassCard hoverEffect>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">AI Bio & Headline Builder</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Transforms raw skills and experience into a polished, high-converting professional bio for your profile card.
          </p>
          <Button variant="gradient" size="sm" onClick={() => setIsBioModalOpen(true)} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
            Generate Bio
          </Button>
        </GlassCard>
      </div>

      <ResumeAnalyzerModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} />
      <BioGeneratorModal isOpen={isBioModalOpen} onClose={() => setIsBioModalOpen(false)} />
    </div>
  );
};

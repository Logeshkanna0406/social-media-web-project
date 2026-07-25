import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, FileText, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { api } from '../../services/api';
import { AIReviewResult } from '../../types';
import { useToast } from '../../hooks/useToast';

interface ResumeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [resumeText, setResumeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIReviewResult | null>(null);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.post('/ai/resume-review', { resumeText });
      setResult(res.data);
      addToast('success', 'Resume Analysis Complete!', `Scored ${res.data.score}/100`);
    } catch (err) {
      addToast('error', 'Analysis failed', 'Could not process resume text.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Resume Reviewer & ATS Optimizer" maxWidth="xl">
      <div className="flex flex-col gap-4">
        {!result ? (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              Paste your resume content or raw markdown below. ConnectHub AI will evaluate ATS compatibility, quantify achievements, and suggest strategic tech keywords.
            </p>

            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste work experience, projects, skills, education..."
              className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 resize-none"
            />

            <Button
              variant="gradient"
              size="md"
              isLoading={isLoading}
              onClick={handleAnalyze}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
            >
              Analyze Resume Now
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Score Badge Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ATS Readiness Score</span>
                <h3 className="text-3xl font-extrabold text-white mt-1">{result.score} <span className="text-sm font-normal text-slate-400">/ 100</span></h3>
              </div>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                result.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {result.score >= 80 ? 'A+' : 'B'}
              </div>
            </div>

            <p className="text-xs text-slate-300 italic border-l-2 border-indigo-500 pl-3">
              "{result.summary}"
            </p>

            {/* Strengths */}
            <div>
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4" /> Key Strengths
              </h4>
              <ul className="flex flex-col gap-1 text-xs text-slate-300">
                {result.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4" /> Recommendations for Higher Callback
              </h4>
              <ul className="flex flex-col gap-1 text-xs text-slate-300">
                {result.improvements.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords */}
            <div>
              <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
                <Key className="w-4 h-4" /> High-Impact Keywords to Add
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.suggestedKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300 font-semibold">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setResult(null)} className="mt-2">
              Analyze Another Resume
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

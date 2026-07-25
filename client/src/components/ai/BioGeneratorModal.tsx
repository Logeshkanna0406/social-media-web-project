import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface BioGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBioAccepted?: (bio: string) => void;
}

export const BioGeneratorModal: React.FC<BioGeneratorModalProps> = ({ isOpen, onClose, onBioAccepted }) => {
  const { addToast } = useToast();
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [skills, setSkills] = useState('React, TypeScript, Node.js, Prisma, Tailwind');
  const [generatedBio, setGeneratedBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/ai/generate-bio', {
        role,
        skills: skills.split(',').map(s => s.trim()),
        experience: 'Building scalable modern web apps'
      });
      setGeneratedBio(res.data.bio);
      addToast('success', 'Professional Bio Generated!');
    } catch (err) {
      addToast('error', 'Bio generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onBioAccepted) onBioAccepted(generatedBio);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Bio & Headline Generator" maxWidth="md">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300">Target Role / Headline</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-100 mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Primary Skills (comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full glass-input rounded-xl p-2.5 text-xs text-slate-100 mt-1"
            />
          </div>
        </div>

        <Button
          variant="gradient"
          size="md"
          isLoading={isLoading}
          onClick={handleGenerate}
          leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
        >
          Generate Bio
        </Button>

        {generatedBio && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col gap-3">
            <p className="text-xs text-slate-200 leading-relaxed italic">"{generatedBio}"</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied to Clipboard' : 'Copy Bio'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

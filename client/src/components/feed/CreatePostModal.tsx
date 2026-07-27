import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Image, BarChart2, Sparkles, X, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { addToast } = useToast();
  const [content, setContent] = useState('');
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleAddPollOption = () => {
    if (pollOptions.length >= 5) {
      addToast('info', 'Maximum options reached', 'Polls can have up to 5 options.');
      return;
    }
    setPollOptions(prev => [...prev, '']);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length <= 2) {
      addToast('info', 'Minimum 2 options', 'A poll requires at least 2 options.');
      return;
    }
    setPollOptions(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File too large', 'Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageDataUri(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAiAssist = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.post('/ai/generate-post', {
        topic: content || 'Software Engineering and AI Innovation',
        tone: 'professional'
      });
      setContent(res.data.post);
      addToast('success', 'AI Post Generated!', 'Review and customize your AI caption.');
    } catch (err) {
      addToast('error', 'AI Generation Failed', 'Please try again.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    const validOptions = pollOptions.map(o => o.trim()).filter(Boolean);

    if (showPoll) {
      if (!pollQuestion.trim()) {
        addToast('error', 'Poll Question Required', 'Please enter a question for your poll.');
        return;
      }
      if (validOptions.length < 2) {
        addToast('error', 'At least 2 Options Required', 'Please enter at least 2 non-empty poll options.');
        return;
      }
    } else {
      if (!trimmedContent && !imageDataUri) {
        addToast('info', 'Post Content Required', 'Please write something or upload an image.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.post('/posts', {
        content: trimmedContent,
        imageDataUri: imageDataUri || null,
        pollQuestion: showPoll ? pollQuestion.trim() : null,
        pollOptions: showPoll ? validOptions : null
      });
      addToast('success', 'Post Published!', 'Your post is now live and saved in database.');
      setContent('');
      setImageDataUri(null);
      setImagePreview('');
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPoll(false);
      onPostCreated();
      onClose();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post" maxWidth="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What technical insights, milestone, or question would you like to share?"
          className="w-full glass-input rounded-xl p-3 text-sm text-slate-100 placeholder-slate-400 resize-none"
        />

        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-48">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageDataUri(null);
                setImagePreview('');
              }}
              className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Poll Fields */}
        {showPoll && (
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" /> Community Poll Creator
              </span>
              <button
                type="button"
                onClick={() => setShowPoll(false)}
                className="text-xs text-slate-400 hover:text-rose-400"
              >
                Remove Poll
              </button>
            </div>

            <input
              type="text"
              placeholder="Ask a question (e.g. Which web framework do you prefer for 2026?)..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="glass-input rounded-lg p-2.5 text-xs text-slate-100 focus:border-indigo-500"
            />

            <div className="flex flex-col gap-2">
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    className="flex-1 glass-input rounded-lg p-2 text-xs text-slate-100"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
                      title="Delete Option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {pollOptions.length < 5 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="self-start flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <label className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" title="Upload Image File">
              <Image className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>

            <button
              type="button"
              onClick={() => setShowPoll(!showPoll)}
              className={`p-2 rounded-lg transition-colors ${
                showPoll ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'
              }`}
              title="Create Poll"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={isGeneratingAi}
              onClick={handleAiAssist}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            >
              AI Assist
            </Button>
          </div>

          <Button variant="gradient" size="sm" isLoading={isSubmitting} type="submit">
            Publish Post
          </Button>
        </div>
      </form>
    </Modal>
  );
};


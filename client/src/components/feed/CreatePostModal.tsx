import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Image, BarChart2, Sparkles, X, Upload } from 'lucide-react';
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
    if (!content.trim() && !imageDataUri && !pollQuestion) return;

    setIsSubmitting(true);
    try {
      await api.post('/posts', {
        content,
        imageDataUri: imageDataUri || null,
        pollQuestion: showPoll ? pollQuestion : null,
        pollOptions: showPoll ? pollOptions.filter(o => o.trim()) : null
      });
      addToast('success', 'Post Published!', 'Your post is now live and saved in database.');
      setContent('');
      setImageDataUri(null);
      setImagePreview('');
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
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Ask a community question..."
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="glass-input rounded-lg p-2 text-xs text-slate-100"
            />
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const updated = [...pollOptions];
                  updated[idx] = e.target.value;
                  setPollOptions(updated);
                }}
                className="glass-input rounded-lg p-2 text-xs text-slate-100"
              />
            ))}
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
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-colors"
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

import React, { useState } from 'react';
import { Comment } from '../../types';
import { api } from '../../services/api';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, onCommentAdded }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post(`/posts/${postId}/comment`, { content: newComment });
      setNewComment('');
      onCommentAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a constructive comment..."
          className="flex-1 glass-input rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-400"
        />
        <Button variant="primary" size="sm" isLoading={isSubmitting} type="submit">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>

      {/* List of Comments */}
      <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
        {comments.map((cm) => (
          <div key={cm.id} className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex gap-2.5 items-start">
            <img src={cm.authorAvatar} alt={cm.authorName} className="w-7 h-7 rounded-lg object-cover" />
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{cm.authorName}</span>
                <span className="text-[10px] text-slate-500">{new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{cm.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

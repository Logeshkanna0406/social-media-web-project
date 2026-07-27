import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { Heart, MessageSquare, Share2, Sparkles, MoreHorizontal } from 'lucide-react';
import { PollComponent } from './PollComponent';
import { CommentSection } from './CommentSection';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';

interface PostCardProps {
  post: Post;
  onRefresh?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onRefresh }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (err) {
      setIsLiked(isLiked);
    }
  };

  return (
    <GlassCard className="mb-4" hoverEffect>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.authorId}`} className="shrink-0 hover:opacity-90 transition-opacity">
            <img
              src={post.author.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt={post.author.fullName}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/30"
            />
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${post.authorId}`} className="text-sm font-bold text-slate-100 hover:text-indigo-400 transition-colors truncate">
                {post.author.fullName}
              </Link>
              {post.isAiGenerated && (
                <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3 text-purple-400" />}>
                  AI Assistant
                </Badge>
              )}
            </div>
            <span className="text-xs text-slate-400 truncate">{post.author.headline || 'Member'}</span>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white p-1 rounded-lg">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Text */}
      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-3">
        {post.content}
      </p>

      {/* Media Attachment */}
      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden mb-3 border border-white/10 max-h-96">
          <img src={post.imageUrl} alt="Post Attachment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
      )}

      {/* Poll */}
      {post.poll && (
        <PollComponent postId={post.id} poll={post.poll} onVoteSuccess={onRefresh} />
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map((tag, idx) => (
            <span key={idx} className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-semibold text-slate-400">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-xl transition-all ${
            isLiked ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
          <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 py-1 px-3 rounded-xl hover:text-white hover:bg-white/5 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>{post.commentsCount || (post.comments ? post.comments.length : 0)} Comments</span>
        </button>

        <button className="flex items-center gap-1.5 py-1 px-3 rounded-xl hover:text-white hover:bg-white/5 transition-all">
          <Share2 className="w-4 h-4 text-purple-400" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments || []}
          onCommentAdded={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </GlassCard>
  );
};

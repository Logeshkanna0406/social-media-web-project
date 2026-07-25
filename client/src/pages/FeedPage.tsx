import React, { useState, useEffect } from 'react';
import { PostCard } from '../components/feed/PostCard';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { PostCardSkeleton } from '../components/ui/Skeleton';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { PlusCircle, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<{ tag: string; postsCount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const [feedRes, trendingRes] = await Promise.all([
        api.get('/posts/feed'),
        api.get('/posts/trending')
      ]);
      setPosts(feedRes.data);
      setTrending(trendingRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed Stream */}
      <div className="lg:col-span-2 flex flex-col">
        {/* Create Post Header Trigger */}
        {user && (
          <GlassCard className="mb-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={user.fullName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 glass-input rounded-xl px-4 py-2.5 text-left text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Share engineering insights, polls, or ask AI for a post draft...
              </button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Post
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Feed List */}
        {isLoading ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} onRefresh={fetchFeed} />
          ))
        ) : (
          <GlassCard className="text-center py-12">
            <p className="text-sm text-slate-400">No posts in feed yet. Be the first to share an update!</p>
          </GlassCard>
        )}

        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPostCreated={fetchFeed}
        />
      </div>

      {/* Sidebar Right Column */}
      <div className="flex flex-col gap-4">
        {/* Trending Hashtags */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100">Trending Topics</h3>
            </div>
            <button onClick={fetchFeed} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {trending.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <span className="text-xs font-bold text-indigo-400">{item.tag}</span>
                <span className="text-[11px] text-slate-400">{item.postsCount} posts</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

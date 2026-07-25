import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, UserPlus, UserCheck, Sparkles, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { useToast } from '../hooks/useToast';

export const NetworkingPage: React.FC = () => {
  const { addToast } = useToast();
  const [suggested, setSuggested] = useState<(User & { mutualConnections?: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await api.get('/users/suggested');
        setSuggested(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/users/search?q=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = (userId: string) => {
    setConnectedIds(prev => [...prev, userId]);
    addToast('success', 'Connection Request Sent!');
  };

  const displayList = searchResults.length > 0 ? searchResults : suggested;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <GlassCard className="flex items-center gap-3">
        <Input
          placeholder="Search professionals by name, skill (e.g. React, Node.js), or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
        <Button variant="gradient" size="md" onClick={handleSearch}>
          Discover
        </Button>
      </GlassCard>

      {/* Suggested Connections Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          {searchResults.length > 0 ? 'Search Results' : 'Recommended People You May Know'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayList.map(person => {
            const isConnected = connectedIds.includes(person.id);
            return (
              <GlassCard key={person.id} hoverEffect className="flex flex-col items-center text-center p-5">
                <img
                  src={person.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt={person.fullName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 mb-3 bg-slate-900"
                />
                <h4 className="text-sm font-bold text-white">{person.fullName}</h4>
                <p className="text-xs text-indigo-400 font-medium line-clamp-1 mt-0.5">{person.headline || 'Software Engineer'}</p>
                {person.mutualConnections && (
                  <span className="text-[10px] text-slate-400 mt-2">{person.mutualConnections} mutual connections</span>
                )}

                <Button
                  variant={isConnected ? 'secondary' : 'outline'}
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => handleConnect(person.id)}
                  leftIcon={isConnected ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                >
                  {isConnected ? 'Pending' : 'Connect'}
                </Button>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

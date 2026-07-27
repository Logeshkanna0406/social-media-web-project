import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Search, UserPlus, UserCheck, Sparkles, MessageSquare, Clock, Check, X, Users, UserMinus } from 'lucide-react';
import { api } from '../services/api';
import { User, PendingConnectionRequest } from '../types';
import { useToast } from '../hooks/useToast';
import { useSocket } from '../context/SocketContext';

export const NetworkingPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  const [activeTab, setActiveTab] = useState<'discover' | 'pending' | 'connections'>('discover');
  const [suggested, setSuggested] = useState<(User & { mutualConnections?: number })[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingConnectionRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Record<string, 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED'>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch suggested users, accepted connections, and pending requests
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sugRes, connRes, pendRes] = await Promise.all([
        api.get('/users/suggested'),
        api.get('/connections'),
        api.get('/connections/pending'),
      ]);

      setSuggested(sugRes.data);
      setConnections(connRes.data);
      setPendingRequests(pendRes.data);

      // Initialize statuses map for suggested users & connections
      const newStatuses: Record<string, 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED'> = {};
      connRes.data.forEach((c: User) => {
        newStatuses[c.id] = 'ACCEPTED';
      });

      // Fetch statuses for suggested users
      await Promise.all(
        sugRes.data.map(async (u: User) => {
          if (!newStatuses[u.id]) {
            try {
              const stRes = await api.get(`/connections/status/${u.id}`);
              newStatuses[u.id] = stRes.data.status;
            } catch (err) {
              newStatuses[u.id] = 'NONE';
            }
          }
        })
      );

      setStatuses(newStatuses);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?q=${searchQuery}`);
      setSearchResults(res.data);

      // Fetch connection status for search results
      const newStatuses = { ...statuses };
      await Promise.all(
        res.data.map(async (u: User) => {
          if (!newStatuses[u.id]) {
            try {
              const stRes = await api.get(`/connections/status/${u.id}`);
              newStatuses[u.id] = stRes.data.status;
            } catch (err) {
              newStatuses[u.id] = 'NONE';
            }
          }
        })
      );
      setStatuses(newStatuses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (targetUserId: string) => {
    try {
      await api.post(`/connections/request/${targetUserId}`);
      setStatuses(prev => ({ ...prev, [targetUserId]: 'PENDING_SENT' }));
      addToast('success', 'Connection Request Sent!');
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleAccept = async (requestId: string, senderId: string) => {
    try {
      await api.post(`/connections/accept/${requestId}`);
      addToast('success', 'Connection Request Accepted!');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setStatuses(prev => ({ ...prev, [senderId]: 'ACCEPTED' }));
      fetchData(); // Refresh connections
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId: string, senderId: string) => {
    try {
      await api.post(`/connections/reject/${requestId}`);
      addToast('info', 'Connection Request Ignored');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      setStatuses(prev => ({ ...prev, [senderId]: 'NONE' }));
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleRemoveConnection = async (targetUserId: string) => {
    try {
      await api.delete(`/connections/${targetUserId}`);
      addToast('info', 'Connection removed');
      setConnections(prev => prev.filter(c => c.id !== targetUserId));
      setStatuses(prev => ({ ...prev, [targetUserId]: 'NONE' }));
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to remove connection');
    }
  };

  const displayList = searchResults.length > 0 ? searchResults : suggested;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <GlassCard className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search professionals by name, skill (e.g. React, Node.js), or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button variant="gradient" size="md" className="w-full sm:w-auto" onClick={handleSearch}>
          Discover
        </Button>
      </GlassCard>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'discover'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Discover {searchResults.length > 0 && `(${searchResults.length})`}
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'pending'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-rose-500 text-white font-extrabold rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'connections'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          My Connections ({connections.length})
        </button>
      </div>

      {/* TAB 1: DISCOVER */}
      {activeTab === 'discover' && (
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            {searchResults.length > 0 ? 'Search Results' : 'Recommended People You May Know'}
          </h3>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading professionals...</div>
          ) : displayList.length === 0 ? (
            <GlassCard className="text-center py-12 text-slate-400 text-xs">
              No users found matching your search.
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {displayList.map(person => {
                const status = statuses[person.id] || 'NONE';
                const isOnline = onlineUsers.includes(person.id);

                return (
                  <GlassCard key={person.id} hoverEffect className="flex flex-col items-center text-center p-5">
                    <div className="relative mb-3">
                      <Link to={`/profile/${person.id}`}>
                        <img
                          src={person.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt={person.fullName}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 bg-slate-900 hover:scale-105 transition-transform"
                        />
                      </Link>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online now" />
                      )}
                    </div>

                    <Link to={`/profile/${person.id}`} className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                      {person.fullName}
                    </Link>
                    <p className="text-xs text-indigo-400 font-medium line-clamp-1 mt-0.5">{person.headline || 'Software Engineer'}</p>
                    {person.mutualConnections && (
                      <span className="text-[10px] text-slate-400 mt-2">{person.mutualConnections} mutual connections</span>
                    )}

                    {status === 'ACCEPTED' ? (
                      <div className="w-full flex gap-2 mt-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/messages?userId=${person.id}`)}
                          leftIcon={<MessageSquare className="w-3.5 h-3.5 text-indigo-400" />}
                        >
                          Message
                        </Button>
                      </div>
                    ) : status === 'PENDING_SENT' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mt-4 cursor-default"
                        disabled
                        leftIcon={<Clock className="w-3.5 h-3.5 text-amber-400" />}
                      >
                        Pending
                      </Button>
                    ) : status === 'PENDING_RECEIVED' ? (
                      <Button
                        variant="gradient"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => setActiveTab('pending')}
                      >
                        Respond to Request
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleConnect(person.id)}
                        leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      >
                        Connect
                      </Button>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING REQUESTS */}
      {activeTab === 'pending' && (
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Incoming Connection Requests
          </h3>

          {pendingRequests.length === 0 ? (
            <GlassCard className="text-center py-12 text-slate-400 text-xs">
              No pending connection requests right now.
            </GlassCard>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRequests.map(req => (
                <GlassCard key={req.id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3.5">
                    <Link to={`/profile/${req.sender.id}`}>
                      <img
                        src={req.sender.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt={req.sender.fullName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 bg-slate-800"
                      />
                    </Link>
                    <div className="flex flex-col">
                      <Link to={`/profile/${req.sender.id}`} className="text-sm font-bold text-white hover:text-indigo-400">
                        {req.sender.fullName}
                      </Link>
                      <span className="text-xs text-indigo-400">{req.sender.headline || 'Member'}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Requested {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="gradient"
                      size="sm"
                      className="flex-1 sm:flex-initial"
                      onClick={() => handleAccept(req.id, req.sender.id)}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-initial text-slate-400 hover:text-rose-400"
                      onClick={() => handleReject(req.id, req.sender.id)}
                      leftIcon={<X className="w-4 h-4" />}
                    >
                      Ignore
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY CONNECTIONS */}
      {activeTab === 'connections' && (
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Your Professional Network
          </h3>

          {connections.length === 0 ? (
            <GlassCard className="text-center py-12 text-slate-400 text-xs">
              You haven't connected with anyone yet. Explore professionals in the 'Discover' tab!
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {connections.map(conn => {
                const isOnline = onlineUsers.includes(conn.id);
                return (
                  <GlassCard key={conn.id} hoverEffect className="flex flex-col items-center text-center p-5">
                    <div className="relative mb-3">
                      <Link to={`/profile/${conn.id}`}>
                        <img
                          src={conn.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt={conn.fullName}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 bg-slate-900 hover:scale-105 transition-transform"
                        />
                      </Link>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online now" />
                      )}
                    </div>

                    <Link to={`/profile/${conn.id}`} className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                      {conn.fullName}
                    </Link>
                    <p className="text-xs text-indigo-400 font-medium line-clamp-1 mt-0.5">{conn.headline || 'Software Engineer'}</p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-[10px] text-slate-400 font-medium">{isOnline ? 'Active Now' : 'Offline'}</span>
                    </div>

                    <div className="w-full flex gap-2 mt-4">
                      <Button
                        variant="gradient"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/messages?userId=${conn.id}`)}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                      >
                        Message
                      </Button>
                      <button
                        onClick={() => handleRemoveConnection(conn.id)}
                        className="p-2 rounded-xl border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove Connection"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

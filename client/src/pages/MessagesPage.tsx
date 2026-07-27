import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Hash, Send, MessageSquare, Users, Circle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Message, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const MessagesPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const targetUserIdParam = searchParams.get('userId');

  const [activeTab, setActiveTab] = useState<'direct' | 'channels'>(targetUserIdParam ? 'direct' : 'direct');
  const [connections, setConnections] = useState<User[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);

  const [activeChannel, setActiveChannel] = useState('channel-react-architects');
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'channel-react-architects', name: 'react-architects', desc: 'Vite, React, Framer Motion & Tailwind' },
    { id: 'channel-ai-engineers', name: 'ai-engineers', desc: 'Gemini, LLM agents & RAG architectures' },
    { id: 'channel-career-advice', name: 'career-advice', desc: 'Resume reviews & salary negotiations' }
  ];

  // Fetch connections & registered professionals for direct messaging
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const [connRes, sugRes] = await Promise.all([
          api.get('/connections'),
          api.get('/users/suggested'),
        ]);

        const mergedMap = new Map<string, User>();
        connRes.data.forEach((u: User) => mergedMap.set(u.id, u));
        sugRes.data.forEach((u: User) => {
          if (!mergedMap.has(u.id)) mergedMap.set(u.id, u);
        });

        const allUsers = Array.from(mergedMap.values());
        setConnections(allUsers);

        if (targetUserIdParam) {
          const match = allUsers.find((c: User) => c.id === targetUserIdParam);
          if (match) {
            setSelectedPartner(match);
          } else {
            try {
              const uRes = await api.get(`/users/${targetUserIdParam}`);
              setSelectedPartner(uRes.data.user);
            } catch (e) {
              if (allUsers.length > 0) setSelectedPartner(allUsers[0]);
            }
          }
        } else if (allUsers.length > 0) {
          setSelectedPartner(allUsers[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchConnections();
  }, [targetUserIdParam]);

  // Fetch messages based on active tab and selection
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'direct' && selectedPartner) {
        const res = await api.get(`/messages/direct/${selectedPartner.id}`);
        setMessages(res.data);
      } else if (activeTab === 'channels') {
        const res = await api.get(`/messages/channel/${activeChannel}`);
        setMessages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab, selectedPartner?.id, activeChannel]);

  // Socket setup for real-time messages
  useEffect(() => {
    if (!socket) return;

    if (activeTab === 'channels') {
      socket.emit('join_channel', activeChannel);
    }

    const handleNewMessage = (newMsg: Message) => {
      if (activeTab === 'channels' && newMsg.channelId === activeChannel) {
        setMessages(prev => [...prev, newMsg]);
      } else if (
        activeTab === 'direct' &&
        selectedPartner &&
        !newMsg.channelId &&
        ((newMsg.senderId === selectedPartner.id && newMsg.receiverId === currentUser?.id) ||
         (newMsg.senderId === currentUser?.id && newMsg.receiverId === selectedPartner.id))
      ) {
        setMessages(prev => [...prev, newMsg]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, activeTab, activeChannel, selectedPartner?.id, currentUser?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const payload = activeTab === 'direct'
      ? { receiverId: selectedPartner?.id, content: textInput }
      : { channelId: activeChannel, content: textInput };

    try {
      const res = await api.post('/messages', payload);
      if (socket) {
        socket.emit('send_message', res.data);
      } else {
        setMessages(prev => [...prev, res.data]);
      }
      setTextInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const isPartnerOnline = selectedPartner ? onlineUsers.includes(selectedPartner.id) : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar: Direct Messages / Channels switcher */}
      <GlassCard className="md:col-span-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 mb-4">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Direct
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'channels' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> Hubs
          </button>
        </div>

        {/* Direct Messages List */}
        {activeTab === 'direct' ? (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              All Professionals & Contacts ({connections.length})
            </h3>

            {connections.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No connections yet. Connect with professionals in Networking!
              </div>
            ) : (
              connections.map(conn => {
                const isOnline = onlineUsers.includes(conn.id);
                const isSelected = selectedPartner?.id === conn.id;

                return (
                  <button
                    key={conn.id}
                    onClick={() => setSelectedPartner(conn)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conn.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt={conn.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{conn.fullName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">{conn.headline || 'Software Engineer'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Community Hubs List */
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Community Hubs</h3>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeChannel === ch.id
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Hash className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{ch.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Main Chat Stream */}
      <GlassCard className="md:col-span-3 flex flex-col justify-between p-4 h-full overflow-hidden">
        {/* Chat Header */}
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          {activeTab === 'direct' ? (
            selectedPartner ? (
              <div className="flex items-center gap-3">
                <Link to={`/profile/${selectedPartner.id}`}>
                  <img
                    src={selectedPartner.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt={selectedPartner.fullName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30 hover:opacity-90"
                  />
                </Link>
                <div className="flex flex-col">
                  <Link to={`/profile/${selectedPartner.id}`} className="text-sm font-bold text-slate-100 hover:text-indigo-400 flex items-center gap-2">
                    {selectedPartner.fullName}
                  </Link>
                  <span className="text-xs text-indigo-400 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    {isPartnerOnline ? 'Active Now' : 'Offline'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-400">Select a connection to start chatting</div>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-400" />
              <div className="flex flex-col">
                <h2 className="text-sm font-bold text-slate-100">{channels.find(c => c.id === activeChannel)?.name}</h2>
                <span className="text-[10px] text-slate-400">{channels.find(c => c.id === activeChannel)?.desc}</span>
              </div>
            </div>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 flex flex-col gap-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex gap-3 items-start ${isSelf ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={msg.senderAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-200">{isSelf ? 'You' : msg.senderName}</span>
                      <span className="text-[9px] text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Footer */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-white/10">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={activeTab === 'direct' && !selectedPartner}
            placeholder={
              activeTab === 'direct'
                ? selectedPartner ? `Message ${selectedPartner.fullName}...` : 'Select a connection...'
                : `Message #${channels.find(c => c.id === activeChannel)?.name}...`
            }
            className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:border-indigo-500"
          />
          <Button variant="gradient" size="sm" type="submit" disabled={activeTab === 'direct' && !selectedPartner}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

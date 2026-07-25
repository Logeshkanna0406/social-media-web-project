import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Hash, Send, Image, UserCheck, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeChannel, setActiveChannel] = useState('channel-react-architects');
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const channels = [
    { id: 'channel-react-architects', name: 'react-architects', desc: 'Vite, React, Framer Motion & Tailwind' },
    { id: 'channel-ai-engineers', name: 'ai-engineers', desc: 'Gemini, LLM agents & RAG architectures' },
    { id: 'channel-career-advice', name: 'career-advice', desc: 'Resume reviews & salary negotiations' }
  ];

  const fetchChannelMessages = async (channelId: string) => {
    try {
      const res = await api.get(`/messages/channel/${channelId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChannelMessages(activeChannel);

    if (socket) {
      socket.emit('join_channel', activeChannel);

      socket.on('new_message', (newMsg: Message) => {
        if (newMsg.channelId === activeChannel) {
          setMessages(prev => [...prev, newMsg]);
        }
      });
    }

    return () => {
      if (socket) socket.off('new_message');
    };
  }, [activeChannel, socket]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const payload = {
      channelId: activeChannel,
      content: textInput
    };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
      {/* Discord-style Channels Sidebar */}
      <GlassCard className="md:col-span-1 flex flex-col p-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Community Hubs</h3>
        <div className="flex flex-col gap-1.5">
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
              <Hash className="w-4 h-4 text-indigo-400" />
              <div className="flex flex-col min-w-0">
                <span className="truncate">{ch.name}</span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Chat Stream */}
      <GlassCard className="md:col-span-3 flex flex-col justify-between p-4 h-full overflow-hidden">
        {/* Channel Header */}
        <div className="pb-3 border-b border-white/10 flex items-center gap-2">
          <Hash className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-100">{channels.find(c => c.id === activeChannel)?.name}</h2>
        </div>

        {/* Message Messages Area */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 items-start">
              <img
                src={msg.senderAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={msg.senderName}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
              />
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{msg.senderName}</span>
                  <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Footer */}
        <form onSubmit={handleSend} className="flex items-center gap-2 pt-3 border-t border-white/10">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name}...`}
            className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400"
          />
          <Button variant="gradient" size="sm" type="submit">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

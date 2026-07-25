import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, TrendingUp, Briefcase, Bot } from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return <div className="text-center py-20 text-slate-400">Loading Platform Analytics...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Total Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">{data.summaryMetrics.totalUsers.toLocaleString()}</h3>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Monthly Active</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-400">{data.summaryMetrics.activeMonthlyUsers.toLocaleString()}</h3>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">Applications</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-purple-400">{data.summaryMetrics.jobApplicationsSubmitted.toLocaleString()}</h3>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold">AI Token Calls</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-400">{data.summaryMetrics.aiGenerationsToday.toLocaleString()}</h3>
        </GlassCard>
      </div>

      {/* User Growth Chart */}
      <GlassCard>
        <h3 className="text-sm font-bold text-slate-100 mb-4">Platform Growth Trajectory</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};

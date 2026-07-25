import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Shield, Users, Flag, Terminal, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { useToast } from '../hooks/useToast';

export const AdminPage: React.FC = () => {
  const { addToast } = useToast();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, reportsRes, logsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/reports'),
          api.get('/admin/logs')
        ]);
        setUsersList(usersRes.data);
        setReports(reportsRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole as any } : u));
      addToast('success', 'Role Updated', `User role changed to ${nextRole}`);
    } catch (err) {
      addToast('error', 'Failed to update user role');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <GlassCard className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-purple-400" />
        <div>
          <h2 className="text-lg font-bold text-white">System Admin Workspace</h2>
          <p className="text-xs text-slate-400">User role control, content moderation queues, and live server logs.</p>
        </div>
      </GlassCard>

      {/* User Management Table */}
      <GlassCard>
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> User Roles & Access
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-900/60 text-slate-400 border-b border-white/10">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 font-semibold text-white">{u.fullName}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === 'ADMIN' ? 'purple' : 'brand'} size="sm">{u.role}</Badge>
                  </td>
                  <td className="p-3">
                    <Button variant="outline" size="sm" onClick={() => handleRoleToggle(u.id, u.role)}>
                      Toggle Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* System Logs */}
      <GlassCard>
        <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> Live System Logs
        </h3>
        <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-500">[{log.timestamp}]</span>
              <span className={log.level === 'WARN' ? 'text-amber-400' : 'text-emerald-400'}>{log.level}:</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

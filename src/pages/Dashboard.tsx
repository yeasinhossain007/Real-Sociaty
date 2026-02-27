import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  StickyNote, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  MessageSquare,
  Clock,
  Lock,
  Sparkles,
  Wand2
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';
import { summarizeContent } from '../services/geminiService';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        )}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
  </div>
);

import BannerAd from '../components/BannerAd';

export default function Dashboard({ user }: any) {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const notes = await res.json();
        
        const usageRes = await fetch('/api/user/usage', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usageData = await usageRes.json();
        setUsage(usageData);

        setStats({
          notes: notes.length,
          tasks: notes.filter((n: any) => n.type === 'todo').length,
          aiInteractions: usageData.aiUsage,
          storage: `${(usageData.storageUsed / (1024 * 1024)).toFixed(2)} MB`
        });
        
        // Mock activities
        setActivities([
          { id: 1, action: 'Note Created', details: 'Project Real Society architecture', time: new Date().toISOString() },
          { id: 2, action: 'AI Chat', details: 'Asked about database optimization', time: new Date(Date.now() - 3600000).toISOString() },
          { id: 3, action: 'Task Completed', details: 'Finish UI design recipes', time: new Date(Date.now() - 86400000).toISOString() },
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    const activityText = activities.map(a => `${a.action}: ${a.details}`).join('\n');
    const summary = await summarizeContent(`Recent user activities:\n${activityText}`);
    setAiSummary(summary);
    setLoadingSummary(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hello, {user?.name}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with Real Society today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <Clock size={18} />
            History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
            <Plus size={18} />
            New Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Notes" value={stats?.notes || 0} icon={StickyNote} trend="up" trendValue="12%" color="bg-blue-500" />
        <StatCard title="Pending Tasks" value={stats?.tasks || 0} icon={Activity} trend="down" trendValue="5%" color="bg-amber-500" />
        <StatCard title="AI Interactions" value={stats?.aiInteractions || 0} icon={MessageSquare} trend="up" trendValue="24%" color="bg-indigo-500" />
        <StatCard title="Storage Used" value={stats?.storage || '0 MB'} icon={TrendingUp} color="bg-emerald-500" />
      </div>

      {usage && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Storage Usage</p>
            <p className="text-xs text-slate-500">{stats?.storage} of {usage.limits.storage / (1024 * 1024) >= 1024 ? `${usage.limits.storage / (1024 * 1024 * 1024)}GB` : `${usage.limits.storage / (1024 * 1024)}MB`}</p>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                (usage.storageUsed / usage.limits.storage) > 0.9 ? "bg-red-500" : "bg-indigo-600"
              )} 
              style={{ width: `${Math.min(100, (usage.storageUsed / usage.limits.storage) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {user?.plan === 'Free' && <BannerAd />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <Activity size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activity.action}</p>
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(activity.time)}</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">AI Summary</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  {aiSummary || "Get a quick overview of your week's productivity using Real Society AI."}
                </p>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={loadingSummary}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingSummary ? <Wand2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {loadingSummary ? "Generating..." : "Generate Now"}
                </button>
              </div>
              <MessageSquare size={120} className="absolute -bottom-10 -right-10 text-indigo-500/30 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Secret Vault</h3>
                <p className="text-slate-400 text-sm mb-4">Your encrypted notes are safe. Access them with your master password.</p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">Access Vault</button>
              </div>
              <Lock size={120} className="absolute -bottom-10 -right-10 text-slate-800 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Smart Suggestions</h2>
            <div className="space-y-3">
              {[
                "Organize your 'Project' notes",
                "Review your pending tasks",
                "Backup your secret vault",
                "Update your profile bio"
              ].map((suggestion, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Friends Online</h2>
            <div className="space-y-4">
              {[
                { name: 'Alice Chen', status: 'online' },
                { name: 'Bob Smith', status: 'away' },
                { name: 'Charlie Day', status: 'online' }
              ].map((friend, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {friend.name.charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{friend.name}</p>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full", friend.status === 'online' ? "bg-emerald-500" : "bg-amber-500")}></div>
                </div>
              ))}
              <button className="w-full py-2 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                Find Friends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

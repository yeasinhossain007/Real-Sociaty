import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Plus, 
  ExternalLink, 
  Share2, 
  Bell, 
  Search,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function YouTube({ user, setUser }: any) {
  const [channelLink, setChannelLink] = useState(user?.youtube_channel || '');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchVideos = async () => {
    if (!user?.youtube_channel) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/youtube/videos', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [user?.youtube_channel]);

  const handleSaveChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...user, youtube_channel: channelLink }),
      });
      if (res.ok) {
        const updatedUser = { ...user, youtube_channel: channelLink };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (video: any) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: `Shared Video: ${video.title}`,
          content: `Check out this video: ${video.url}`,
          type: 'note'
        }),
      });
      if (res.ok) {
        alert('Video shared to your notes!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Youtube className="text-red-600" size={32} />
            YouTube Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Connect your channel and manage your content.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSaveChannel} className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">YouTube Channel Link or ID</label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="https://youtube.com/@yourchannel or Channel ID" 
                value={channelLink}
                onChange={(e) => setChannelLink(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              />
            </div>
            <button 
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : <Save size={20} />}
              {saving ? 'Saving...' : success ? 'Saved!' : 'Connect Channel'}
            </button>
          </div>
          <p className="text-xs text-slate-400">Example: https://youtube.com/@Google or UC_x5XG1OV2P6uZZ5FSM9Ttw</p>
        </form>
      </div>

      {user?.youtube_channel ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Videos</h2>
            <a 
              href={user.youtube_channel.startsWith('http') ? user.youtube_channel : `https://youtube.com/channel/${user.youtube_channel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
            >
              <Bell size={18} />
              Subscribe
            </a>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-slate-500 font-medium">Fetching your latest content...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20">
              <AlertCircle className="text-red-500" size={48} />
              <p className="text-red-600 font-bold">{error}</p>
              <button onClick={fetchVideos} className="text-indigo-600 font-bold hover:underline">Try Again</button>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    <a 
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl">
                        <Youtube size={24} />
                      </div>
                    </a>
                  </div>
                  <div className="p-5 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight h-10">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between pt-2">
                      <button 
                        onClick={() => handleShare(video)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                      <a 
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Watch
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
              <Youtube className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-500 font-medium">No videos found for this channel.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
          <Youtube className="mx-auto text-slate-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect Your Channel</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Enter your YouTube channel link above to see your latest videos and share them with your Real Society network.
          </p>
        </div>
      )}
    </div>
  );
}

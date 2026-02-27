import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Camera, 
  Shield, 
  Bell, 
  Smartphone, 
  Globe, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Youtube
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile({ user, setUser }: any) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profile_photo: user?.profile_photo || '',
    youtube_channel: user?.youtube_channel || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Personal Information</h2>
            
            {message.text && (
              <div className={cn(
                "mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border",
                message.type === 'success' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              )}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                    {formData.name.charAt(0)}
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-all">
                    <Camera size={18} />
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Photo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload a professional photo or use an avatar.</p>
                  <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
                    <button type="button" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all">Upload New</button>
                    <button type="button" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Remove</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      disabled
                      value={user?.email}
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bio / Description</label>
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">YouTube Channel</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.youtube_channel}
                    onChange={(e) => setFormData({ ...formData, youtube_channel: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="Channel link or ID"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Privacy</h2>
                <a href="/privacy" className="text-xs font-bold text-indigo-600 hover:underline">Read Full Policy</a>
              </div>
              <div className="space-y-6">
              {[
                { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.', icon: Shield, active: true },
                { title: 'Login Alerts', desc: 'Get notified when someone logs in from a new device.', icon: Bell, active: false },
                { title: 'Public Profile', desc: 'Allow others to see your bio and shared notes.', icon: Globe, active: false }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-slate-900 text-indigo-600 rounded-xl border border-slate-100 dark:border-slate-700">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <button className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    item.active ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      item.active ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Device Control</h2>
            <div className="space-y-4">
              {[
                { name: 'MacBook Pro', location: 'San Francisco, CA', icon: Smartphone, current: true },
                { name: 'iPhone 15', location: 'San Francisco, CA', icon: Smartphone, current: false }
              ].map((device, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg">
                      <device.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{device.name} {device.current && <span className="text-[10px] text-emerald-500 ml-1">(Current)</span>}</p>
                      <p className="text-[10px] text-slate-500">{device.location}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <button className="text-[10px] font-bold text-red-500 hover:underline">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
            <p className="text-xs text-red-500/70 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2">
              <Trash2 size={18} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Lock, 
  FileText, 
  CheckSquare, 
  MoreVertical, 
  Trash2, 
  Shield, 
  Eye, 
  EyeOff,
  Sparkles,
  Filter,
  X,
  Wand2,
  FileSearch,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { generateNoteFromPrompt, summarizeContent } from '../services/geminiService';

export default function Notes({ user }: any) {
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', is_secret: false, password: '', type: 'note' });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadAll = () => {
    if (notes.length === 0) {
      alert("No notes to download.");
      return;
    }

    const content = notes.map(note => {
      const date = new Date(note.created_at).toLocaleString();
      const title = note.is_secret ? 'Secret Note (Encrypted)' : note.title;
      const body = note.is_secret ? '[Encrypted Content]' : note.content;
      return `-----------------------------------\nTitle: ${title}\nDate: ${date}\nType: ${note.type}\n-----------------------------------\n\n${body}\n\n`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Real_Society_Notes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewNote({ title: '', content: '', is_secret: false, password: '', type: 'note' });
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIWrite = async () => {
    if (!newNote.title) {
      alert("Please enter a title first so AI knows what to write about.");
      return;
    }
    setAiLoading(true);
    const content = await generateNoteFromPrompt(newNote.title);
    setNewNote({ ...newNote, content });
    setAiLoading(false);
  };

  const handleAISummarize = async (note: any) => {
    setAiLoading(true);
    const summary = await summarizeContent(note.content);
    alert(`AI Summary of "${note.title}":\n\n${summary}`);
    setAiLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || n.type === filter || (filter === 'secret' && n.is_secret);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notes & Data</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your thoughts, tasks, and encrypted data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download size={20} />
            Download All
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus size={20} />
            Create New
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search your notes, files, or tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', icon: FileText },
            { id: 'note', label: 'Notes', icon: FileText },
            { id: 'todo', label: 'To-dos', icon: CheckSquare },
            { id: 'secret', label: 'Secret', icon: Lock },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border",
                filter === item.id 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none" 
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              {note.is_secret && (
                <div className="absolute top-0 right-0 p-3">
                  <Lock size={16} className="text-amber-500" />
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  note.type === 'todo' ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                )}>
                  {note.type === 'todo' ? <CheckSquare size={20} /> : <FileText size={20} />}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleAISummarize(note)}
                    title="AI Summarize"
                    className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                  >
                    <FileSearch size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      const date = new Date(note.created_at).toLocaleString();
                      const title = note.is_secret ? 'Secret Note (Encrypted)' : note.title;
                      const body = note.is_secret ? '[Encrypted Content]' : note.content;
                      const content = `Title: ${title}\nDate: ${date}\nType: ${note.type}\n\n${body}`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${title.replace(/\s+/g, '_')}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Download Note"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                  >
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate">
                {note.is_secret ? '••••••••' : note.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6">
                {note.is_secret ? 'This note is encrypted and requires a password to view.' : note.content}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(note.created_at)}</span>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 group/btn">
                  View Details
                  <Sparkles size={12} className="group-hover/btn:rotate-12 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <form onSubmit={handleCreate} className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Item</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'note', label: 'Note', icon: FileText },
                    { id: 'todo', label: 'To-do List', icon: CheckSquare },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewNote({ ...newNote, type: type.id })}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold",
                        newNote.type === type.id 
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" 
                          : "border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <type.icon size={20} />
                      {type.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                  <input 
                    type="text" 
                    required
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="Enter a descriptive title..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Content</label>
                    <button 
                      type="button"
                      onClick={handleAIWrite}
                      disabled={aiLoading}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all disabled:opacity-50"
                    >
                      <Wand2 size={14} className={cn(aiLoading && "animate-spin")} />
                      AI Auto-Write
                    </button>
                  </div>
                  <textarea 
                    required
                    rows={5}
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
                    placeholder="Write your thoughts or list items here..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Secret Note</p>
                      <p className="text-xs text-slate-500">Encrypt this note with a password</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setNewNote({ ...newNote, is_secret: !newNote.is_secret })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      newNote.is_secret ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      newNote.is_secret ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                {newNote.is_secret && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Vault Password</label>
                    <input 
                      type="password" 
                      required
                      value={newNote.password}
                      onChange={(e) => setNewNote({ ...newNote, password: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                      placeholder="Enter master password..."
                    />
                  </motion.div>
                )}
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading || aiLoading}
                  className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-70"
                >
                  {loading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

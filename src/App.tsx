/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  StickyNote, 
  User, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Search,
  Bell,
  Moon,
  Sun,
  Lock,
  Users,
  BarChart3,
  CreditCard,
  Youtube,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Pages ---
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Notes from './pages/Notes';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import YouTube from './pages/YouTube';
import PrivacyPolicy from './pages/PrivacyPolicy';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Layout = ({ children, user, setUser, darkMode, setDarkMode }: any) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = window.location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className={cn("min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300", darkMode && "dark")}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Real Society</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" active={location === '/'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={MessageSquare} label="AI Assistant" to="/chat" active={location === '/chat'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={StickyNote} label="Notes & Data" to="/notes" active={location === '/notes'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={Youtube} label="YouTube Hub" to="/youtube" active={location === '/youtube'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={CreditCard} label="Subscription" to="/pricing" active={location === '/pricing'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={User} label="Profile" to="/profile" active={location === '/profile'} onClick={() => setIsSidebarOpen(false)} />
            <SidebarItem icon={Shield} label="Privacy Policy" to="/privacy" active={location === '/privacy'} onClick={() => setIsSidebarOpen(false)} />
            {user?.role === 'admin' && (
              <SidebarItem icon={BarChart3} label="Admin Panel" to="/admin" active={location === '/admin'} onClick={() => setIsSidebarOpen(false)} />
            )}
          </nav>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-bottom border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu size={24} />
          </button>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search notes, tasks, or ask AI..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm border border-indigo-200 dark:border-indigo-800">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup setUser={setUser} /> : <Navigate to="/" />} />
        
        <Route path="/*" element={
          user ? (
            <Layout user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode}>
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/chat" element={<Chat user={user} />} />
                <Route path="/notes" element={<Notes user={user} />} />
                <Route path="/youtube" element={<YouTube user={user} setUser={setUser} />} />
                <Route path="/pricing" element={<Pricing user={user} setUser={setUser} />} />
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                {user.role === 'admin' && <Route path="/admin" element={<Admin />} />}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

import React from 'react';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Data Collection",
      icon: Eye,
      content: "We collect minimal data necessary to provide our services. This includes your name, email address, and the content you explicitly create (notes, tasks, YouTube links). We do not track your browsing history or sell your personal information."
    },
    {
      title: "Encryption & Security",
      icon: Lock,
      content: "Your 'Secret Notes' are encrypted using industry-standard protocols. We use secure hashing for passwords and JWT for session management. Your data is stored in a secure environment with restricted access."
    },
    {
      title: "AI Interactions",
      icon: Shield,
      content: "When you interact with our AI Assistant, your queries are processed to provide personalized responses. We do not use your private notes to train global AI models without your explicit consent."
    },
    {
      title: "Third-Party Services",
      icon: FileText,
      content: "We integrate with YouTube to show your latest content. When you connect your channel, we only access public information required to display your videos. We do not post on your behalf."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl mb-4">
          <Shield size={40} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Privacy & Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          At Real Society, your privacy is our top priority. We are committed to protecting your data and being transparent about how we use it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6">
              <section.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{section.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-200 dark:shadow-none">
        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-bold">Your Rights</h2>
          <p className="text-indigo-100 max-w-2xl">
            You have the right to access, correct, or delete your data at any time. You can download all your notes from the 'Notes & Data' section or delete your entire account from the 'Profile' settings.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all flex items-center gap-2">
              Contact Support
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center text-xs text-slate-400 pt-8">
        Last updated: February 27, 2026 • © 2026 Real Society Inc.
      </div>
    </div>
  );
}

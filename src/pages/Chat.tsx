import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Mic, 
  MicOff,
  Paperclip,
  MoreVertical,
  Trash2,
  RefreshCw,
  Volume2,
  VolumeX,
  BrainCircuit,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { getAIResponse, speakText, getSmartSuggestions } from '../services/geminiService';

export default function Chat({ user }: any) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: `Hello ${user?.name}! I'm Real Society AI. I've been learning from your recent activities. How can I assist you today?`, time: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [context, setContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch context and suggestions
    const initAI = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const notes = await res.json();
        const recentNotes = notes.slice(0, 5).map((n: any) => n.title).join(', ');
        const userContext = `User has ${notes.length} notes. Recent topics: ${recentNotes}`;
        setContext(userContext);

        const smartSugs = await getSmartSuggestions(userContext);
        setSuggestions(smartSugs);
      } catch (err) {
        console.error(err);
      }
    };
    initAI();

    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    // Check usage limits
    if (user?.plan === 'Free' && user?.ai_usage_count >= 10) {
      alert("You've reached your free AI limit (10 messages). Please upgrade to Pro for unlimited access!");
      return;
    }

    const userMessage = { role: 'user', text: textToSend, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const aiText = await getAIResponse(textToSend, history, context);
      
      const aiMessage = { 
        role: 'assistant', 
        text: aiText, 
        time: new Date().toISOString() 
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (isSpeaking) {
        await speakText(aiText || "");
      }

      // Update local user state for usage tracking
      if (user?.plan === 'Free') {
        const updatedUser = { ...user, ai_usage_count: (user.ai_usage_count || 0) + 1 };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Log activity
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action: 'AI Chat', details: textToSend }),
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Real Society AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Learning from your activity</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSpeaking(!isSpeaking)}
            className={cn(
              "p-2 rounded-lg transition-all",
              isSpeaking ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {isSpeaking ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none"
            )}>
              <div className="markdown-body">
                <Markdown>{msg.text}</Markdown>
              </div>
              <div className={cn(
                "text-[10px] mt-2 opacity-50",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Bot size={16} />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask Real Society anything..."}
              className={cn(
                "w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white",
                isListening && "ring-2 ring-red-500 border-red-500"
              )}
            />
            <button 
              type="button"
              onClick={toggleListening}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                isListening ? "text-red-500 animate-pulse" : "text-slate-400 hover:text-indigo-500"
              )}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Send size={20} />
          </button>
        </form>
        
        <div className="flex items-center gap-4 mt-3 px-2 overflow-hidden">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            <Sparkles size={12} className="text-indigo-500" />
            Smart Suggestions:
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(undefined, s.text)}
                  className="whitespace-nowrap px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-1.5"
                >
                  {s.type === 'question' ? <Bot size={12} /> : <Wand2 size={12} />}
                  {s.text}
                </button>
              ))
            ) : (
              ["Summarize my day", "Create a to-do list", "Write a secret note"].map((s, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                >
                  {s}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

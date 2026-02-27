import React, { useState } from 'react';
import { Check, Zap, Crown, Shield, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const PlanCard = ({ title, price, features, icon: Icon, color, isCurrent, onUpgrade, loading }: any) => (
  <div className={cn(
    "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 transition-all relative overflow-hidden flex flex-col",
    isCurrent ? "border-indigo-600 shadow-xl shadow-indigo-100 dark:shadow-none" : "border-slate-100 dark:border-slate-800 hover:border-indigo-200"
  )}>
    {isCurrent && (
      <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-widest">
        Current Plan
      </div>
    )}
    
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", color)}>
      <Icon size={28} />
    </div>
    
    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-4xl font-bold text-slate-900 dark:text-white">${price}</span>
      <span className="text-slate-500 dark:text-slate-400 font-medium">/month</span>
    </div>
    
    <div className="space-y-4 flex-1 mb-10">
      {features.map((feature: string, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
        </div>
      ))}
    </div>
    
    <button 
      onClick={() => onUpgrade(title)}
      disabled={isCurrent || loading}
      className={cn(
        "w-full py-4 rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:shadow-none",
        isCurrent 
          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default" 
          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-none"
      )}
    >
      {isCurrent ? 'Active' : loading ? 'Processing...' : `Upgrade to ${title}`}
    </button>
  </div>
);

export default function Pricing({ user, setUser }: any) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const updatedUser = { ...user, plan };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert(`Successfully upgraded to ${plan}!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Choose Your Plan</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Unlock the full potential of Real Society with our premium features and advanced AI capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PlanCard 
          title="Free" 
          price="0" 
          icon={Star}
          color="bg-slate-400"
          isCurrent={user?.plan === 'Free'}
          onUpgrade={handleUpgrade}
          loading={loading}
          features={[
            "10 AI Questions / Month",
            "500MB Data Storage",
            "Standard Support",
            "Basic Notes & Tasks"
          ]}
        />
        <PlanCard 
          title="Pro" 
          price="19" 
          icon={Zap}
          color="bg-indigo-600"
          isCurrent={user?.plan === 'Pro'}
          onUpgrade={handleUpgrade}
          loading={loading}
          features={[
            "Unlimited AI Questions",
            "10GB Data Storage",
            "Priority Support",
            "Ad-Free Experience",
            "Advanced AI Summaries"
          ]}
        />
        <PlanCard 
          title="VIP" 
          price="49" 
          icon={Crown}
          color="bg-amber-500"
          isCurrent={user?.plan === 'VIP'}
          onUpgrade={handleUpgrade}
          loading={loading}
          features={[
            "Everything in Pro",
            "Unlimited Storage",
            "Personal AI Training",
            "Early Access Features",
            "Dedicated Support"
          ]}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Enterprise Needs?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Custom solutions for large teams and organizations.</p>
        <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
          Contact Sales
        </button>
      </div>
    </div>
  );
}

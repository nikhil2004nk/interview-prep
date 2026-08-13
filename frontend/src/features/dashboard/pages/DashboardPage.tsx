import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchDashboardMetricsApi } from '../api/dashboard';
import type { DashboardMetrics } from '../api/dashboard';
import { FileText, Target, BookOpen, LogOut, Loader2, Sparkles, Award, ClipboardCheck, ArrowRight, User as UserIcon } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchDashboardMetricsApi();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="animate-spin text-purple-500" size={32} />
        <span className="text-xs font-semibold tracking-wider uppercase">Loading Dashboard Analytics...</span>
      </div>
    );
  }

  const progressPercentage =
    metrics.activeGoalsCount + metrics.completedGoalsCount > 0
      ? Math.round(
          (metrics.completedGoalsCount / (metrics.activeGoalsCount + metrics.completedGoalsCount)) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Navigation */}
      <header className="p-4 border-b border-slate-900 bg-slate-900/30 flex justify-between items-center backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/10">
            🎓
          </div>
          <div>
            <span className="font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-sm md:text-base">
              PrepHQ
            </span>
            <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Interview Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl">
            <UserIcon size={12} className="text-purple-400" />
            <span className="text-xs font-semibold text-slate-300">
              {user?.name || user?.email || 'Nikhil Kushwaha'}
            </span>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-all cursor-pointer border border-transparent hover:border-slate-750"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <main className="max-w-5xl w-full mx-auto p-6 space-y-8 flex-1">
        <div className="relative rounded-3xl border border-slate-850 p-6 md:p-8 bg-gradient-to-r from-purple-900/10 via-pink-900/5 to-slate-950 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-purple-600/5 filter blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-pink-600/5 filter blur-3xl"></div>
          
          <div className="space-y-2 text-center md:text-left z-10">
            <h1 className="text-xl md:text-3xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="text-amber-400" size={24} />
              Welcome Back, {user?.name?.split(' ')[0] || 'Prepmaster'}!
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed">
              Your preparation status is healthy. Track your revision decks, update your study targets, and practice daily coding questions to ensure interview readiness.
            </p>
          </div>
          <div className="flex gap-3 z-10 shrink-0">
            <button
              onClick={() => navigate('/revision')}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/10 text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={14} />
              Start Reviewing
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Notes Stats */}
          <div
            onClick={() => navigate('/notes')}
            className="p-5 rounded-2xl border border-slate-850 bg-slate-900/15 hover:bg-slate-900/30 hover:border-slate-750 transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-center">
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <FileText size={16} />
              </span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-slate-200 block">{metrics.notesCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Notes Written</span>
            </div>
          </div>

          {/* Question Stats */}
          <div
            onClick={() => navigate('/questions')}
            className="p-5 rounded-2xl border border-slate-850 bg-slate-900/15 hover:bg-slate-900/30 hover:border-slate-750 transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-center">
              <span className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                <ClipboardCheck size={16} />
              </span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-slate-200 block">{metrics.questionsPracticedCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Questions Practiced</span>
            </div>
          </div>

          {/* Average AI Score */}
          <div
            onClick={() => navigate('/questions')}
            className="p-5 rounded-2xl border border-slate-850 bg-slate-900/15 hover:bg-slate-900/30 hover:border-slate-750 transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-center">
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Award size={16} />
              </span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-slate-200 block">
                {metrics.averageScore}%
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Evaluation Avg</span>
            </div>
          </div>

          {/* Flashcards Due */}
          <div
            onClick={() => navigate('/revision')}
            className="p-5 rounded-2xl border border-slate-850 bg-slate-900/15 hover:bg-slate-900/30 hover:border-slate-750 transition-all cursor-pointer group flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-center">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BookOpen size={16} />
              </span>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-black text-slate-200 block">{metrics.revisionDueCount}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Reviews Due Today</span>
            </div>
          </div>
        </div>

        {/* Targets & Goals status progress block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goals Milestone Tracker */}
          <div
            onClick={() => navigate('/goals')}
            className="border border-slate-850 rounded-2xl p-6 bg-slate-900/10 space-y-6 hover:border-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Target size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-350">Study Milestones</h3>
                  <span className="text-[10px] text-slate-500 font-medium">Link topics and complete goals</span>
                </div>
              </div>
              <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/15">
                {metrics.completedGoalsCount} / {metrics.activeGoalsCount + metrics.completedGoalsCount} Completed
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-850 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Daily Routine Summary */}
          <div
            onClick={() => navigate('/revision')}
            className="border border-slate-850 rounded-2xl p-6 bg-slate-900/10 space-y-4 hover:border-slate-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BookOpen size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-350">Spaced Repetition System</h3>
                <span className="text-[10px] text-slate-500 font-medium">Daily reviews scheduled by SM2</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {metrics.revisionDueCount > 0
                ? `You have ${metrics.revisionDueCount} items waiting in your revision stack. Reviewing notes and questions systematically prevents knowledge decay.`
                : 'Excellent! Your revision deck is empty for today. Review more materials or write new notes to fill your backlog.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

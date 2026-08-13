import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchDashboardMetricsApi } from '../api/dashboard';
import type { DashboardMetrics } from '../api/dashboard';
import { FileText, Target, BookOpen, LogOut, Loader2, Sparkles, Award, ClipboardCheck, ArrowRight, User as UserIcon, Tag as TagIcon, ChevronDown, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/hooks/useTheme';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, setMode } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <Loader2 className="animate-spin text-primary-500" size={32} />
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
      <header className="p-4 border-b border-slate-900 bg-slate-950 flex justify-between items-center backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-primary-500/10">
            🎓
          </div>
          <div>
            <span className="font-black bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent text-sm md:text-base">
              PrepHQ
            </span>
            <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">Interview Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-primary-400 focus:outline-none focus:border-primary-500/50"
            title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-colors cursor-pointer focus:outline-none focus:border-primary-500/50"
            >
              <UserIcon size={12} className="text-primary-400" />
              <span className="text-xs font-semibold text-slate-300">
                {user?.name || user?.email || 'Nikhil Kushwaha'}
              </span>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-850 hover:text-primary-400 font-semibold transition-colors flex items-center gap-2 cursor-pointer border-b border-slate-800/80"
              >
                <UserIcon size={14} /> Profile
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-850 hover:text-primary-400 font-semibold transition-colors flex items-center gap-2 cursor-pointer border-b border-slate-800/80"
              >
                <Settings size={14} /> Settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-red-500 hover:text-slate-200 font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={14} /> Sign Out
              </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <main className="max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6 flex-1">
        <div className="relative rounded-2xl border border-slate-850 p-5 md:p-6 bg-gradient-to-r from-primary-900/10 via-secondary-900/5 to-slate-950 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-primary-600/5 filter blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-secondary-600/5 filter blur-3xl"></div>
          
          <div className="space-y-2 text-center md:text-left z-10">
            <h1 className="text-lg md:text-xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="text-amber-400" size={20} />
              Welcome Back, {user?.name?.split(' ')[0] || 'Prepmaster'}!
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-lg leading-relaxed">
              Your preparation status is healthy. Track your revision decks, update your study targets, and practice daily coding questions to ensure interview readiness.
            </p>
          </div>
          <div className="flex gap-3 z-10 shrink-0">
            <button
              onClick={() => navigate('/taxonomy')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-slate-200 border border-slate-800 font-bold rounded-lg text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <TagIcon size={14} className="text-secondary-400" />
              Manage Tags & Topics
            </button>
            <button
              onClick={() => navigate('/revision')}
              className="px-4 py-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold rounded-lg shadow-lg shadow-primary-500/10 text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={14} />
              Start Reviewing
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Notes Stats */}
          <div
            onClick={() => navigate('/notes')}
            className="p-3 rounded-lg border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex justify-between items-center">
              <span className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">
                <FileText size={14} />
              </span>
              <ArrowRight size={12} className="text-slate-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-0.5">
              <span className="text-lg font-black text-slate-200 block">{metrics.notesCount}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Notes Written</span>
            </div>
          </div>

          {/* Question Stats */}
          <div
            onClick={() => navigate('/questions')}
            className="p-3 rounded-lg border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex justify-between items-center">
              <span className="w-7 h-7 rounded-lg bg-secondary-500/10 flex items-center justify-center text-secondary-400">
                <ClipboardCheck size={14} />
              </span>
              <ArrowRight size={12} className="text-slate-600 group-hover:text-secondary-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-0.5">
              <span className="text-lg font-black text-slate-200 block">{metrics.questionsPracticedCount}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Questions Practiced</span>
            </div>
          </div>

          {/* Average AI Score */}
          <div
            onClick={() => navigate('/questions')}
            className="p-3 rounded-lg border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex justify-between items-center">
              <span className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Award size={14} />
              </span>
              <ArrowRight size={12} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-0.5">
              <span className="text-lg font-black text-slate-200 block">
                {metrics.averageScore}%
              </span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">AI Evaluation Avg</span>
            </div>
          </div>

          {/* Flashcards Due */}
          <div
            onClick={() => navigate('/revision')}
            className="p-3 rounded-lg border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-24"
          >
            <div className="flex justify-between items-center">
              <span className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <BookOpen size={14} />
              </span>
              <ArrowRight size={12} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-0.5">
              <span className="text-lg font-black text-slate-200 block">{metrics.revisionDueCount}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Reviews Due Today</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Study Journey */}
        <div className="space-y-3 pt-2">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            🚀 Your Prep Journey
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1: Notes */}
            <div
              onClick={() => navigate('/notes')}
              className="relative p-3 rounded-xl border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-700 group-hover:text-primary-400">01</div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-primary-450 uppercase tracking-widest block">Step 1: Concepts</span>
                <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-primary-300 transition-colors">Write Notes</h3>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-3">
                  Draft syntax examples, key questions, and architectural logs.
                </p>
              </div>
            </div>

            {/* Step 2: Goals */}
            <div
              onClick={() => navigate('/goals')}
              className="relative p-3 rounded-xl border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-700 group-hover:text-secondary-400">02</div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-secondary-450 uppercase tracking-widest block">Step 2: Milestones</span>
                <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-secondary-300 transition-colors">Set Goals</h3>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-3">
                  Establish milestone deadlines and link target study topics.
                </p>
              </div>
            </div>

            {/* Step 3: Practice */}
            <div
              onClick={() => navigate('/questions')}
              className="relative p-3 rounded-xl border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-700 group-hover:text-amber-400">03</div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-amber-450 uppercase tracking-widest block">Step 3: Verification</span>
                <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-amber-300 transition-colors">AI Practice</h3>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-3">
                  Get real-time scores and keyword critiques from our AI.
                </p>
              </div>
            </div>

            {/* Step 4: Spaced Repetition */}
            <div
              onClick={() => navigate('/revision')}
              className="relative p-3 rounded-xl border border-slate-850 bg-slate-900 hover:bg-slate-850 hover:border-slate-800 transition-all cursor-pointer group flex flex-col justify-between h-36"
            >
              <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-700 group-hover:text-blue-400">04</div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-blue-450 uppercase tracking-widest block">Step 4: Retention</span>
                <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-blue-300 transition-colors">Revision</h3>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-3">
                  Queue cards and run review sessions using SM-2 algorithm.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Targets & Goals status progress block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goals Milestone Tracker */}
          <div
            onClick={() => navigate('/goals')}
            className="border border-slate-850 rounded-xl p-5 bg-slate-900/10 space-y-4 hover:border-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400">
                  <Target size={14} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-300">Study Milestones</h3>
                  <span className="text-[9px] text-slate-500 font-medium">Link topics and complete goals</span>
                </div>
              </div>
              <span className="text-xs font-black text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded border border-primary-500/15">
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
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
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
                <h3 className="text-sm font-bold text-slate-300">Spaced Repetition System</h3>
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

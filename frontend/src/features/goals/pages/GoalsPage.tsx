import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchGoalsApi,
  createGoalApi,
  toggleGoalApi,
  deleteGoalApi
} from '../api/goals';
import type { Goal } from '../api/goals';
import type { Topic } from '../../notes/api/notes';
import { fetchTopicsApi } from '../../topics/api/topics';
import { Search, Plus, Trash2, ArrowLeft, Calendar, CheckSquare, Square, Target, Award, Clock, FileText, HelpCircle, BookOpen, LogOut, X } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';

export const GoalsPage: React.FC = () => {
  const { logout } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm' | 'error' | 'success';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');

  // Creation Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const navigate = useNavigate();

  const loadGoalsData = async () => {
    try {
      const [goalsData, topicsData] = await Promise.all([
        fetchGoalsApi(),
        fetchTopicsApi(),
      ]);
      setGoals(goalsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to load goals workspace', error);
    }
  };

  useEffect(() => {
    loadGoalsData();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length >= 3 || searchQuery.trim().length === 0) {
        setDebouncedSearchQuery(searchQuery);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleCreateGoal = async () => {
    if (!newTitle.trim() || !newTargetDate) return;
    try {
      const created = await createGoalApi({
        title: newTitle,
        targetDate: newTargetDate,
        topicIds: selectedTopicIds,
      });
      setGoals(prev => [...prev, created]);
      setSelectedGoal(created);
      setNewTitle('');
      setNewTargetDate('');
      setSelectedTopicIds([]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create goal', error);
    }
  };

  const handleToggleGoal = async (id: string) => {
    try {
      const updated = await toggleGoalApi(id);
      setGoals(prev => prev.map(g => (g.id === updated.id ? updated : g)));
      if (selectedGoal?.id === id) {
        setSelectedGoal(updated);
      }
    } catch (error) {
      console.error('Failed to toggle goal', error);
    }
  };

  const handleDeleteGoal = (id: string) => {
    const target = goals.find(g => g.id === id);
    const titleText = target?.title ? `"${target.title}"` : 'this study goal';
    setModal({
      isOpen: true,
      title: 'Delete Milestone',
      message: `Are you sure you want to permanently delete the study goal ${titleText}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteGoalApi(id);
          setGoals(prev => prev.filter(g => g.id !== id));
          if (selectedGoal?.id === id) {
            setSelectedGoal(null);
          }
        } catch (error) {
          console.error('Failed to delete goal', error);
        }
      }
    });
  };

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const filteredGoals = goals.filter(g => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      g.title.toLowerCase().includes(query) ||
      (g.topics || []).some(t => t.name.toLowerCase().includes(query));

    const matchesStatus =
      !selectedStatusFilter ||
      (selectedStatusFilter === 'COMPLETED' ? g.completed : !g.completed);

    const matchesTopic =
      !selectedTopicFilter ||
      (g.topics || []).some(t => t.id === selectedTopicFilter);

    return matchesSearch && matchesStatus && matchesTopic;
  });

  const getDaysRemainingText = (dateStr: string) => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days left`;
  };

  const completedCount = goals.filter(g => g.completed).length;
  const completionPercentage = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-slate-900/40 border-r border-slate-800/80 flex flex-col h-auto md:h-screen">
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Study Goals
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/notes')}
              title="Notes Workspace"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={() => navigate('/questions')}
              title="Practice Center"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={() => navigate('/revision')}
              title="Revision Deck"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
                title="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 border-b border-slate-900/50 space-y-1.5">
          <Dropdown
            value={selectedStatusFilter}
            onChange={setSelectedStatusFilter}
            options={[
              { value: '', label: 'All Milestones' },
              { value: 'ACTIVE', label: 'Active Goals' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
            placeholder="Filter Status"
          />

          <Dropdown
            value={selectedTopicFilter}
            onChange={setSelectedTopicFilter}
            options={[
              { value: '', label: 'All Topics' },
              ...topics.map(t => ({ value: t.id, label: t.name })),
            ]}
            placeholder="All Topics"
          />
        </div>

        {/* Goals list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No study goals found
            </div>
          ) : (
            filteredGoals.map(g => (
              <div
                key={g.id}
                onClick={() => {
                  setSelectedGoal(g);
                  setShowAddForm(false);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                  selectedGoal?.id === g.id && !showAddForm
                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleGoal(g.id);
                    }}
                    className="mt-0.5 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer shrink-0"
                  >
                    {g.completed ? (
                      <CheckSquare size={16} className="text-purple-400" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm font-semibold truncate transition-colors ${
                      g.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-purple-400'
                    }`}>
                      {g.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <Clock size={10} />
                      {getDaysRemainingText(g.targetDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Goal Button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-sm"
          >
            <Plus size={16} />
            Set New Goal
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen bg-slate-950 overflow-y-auto">
        {showAddForm ? (
          <div className="max-w-2xl w-full mx-auto p-6 space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Set Interview Target Goal
            </h2>
            <div className="space-y-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Goal Description</label>
                <input
                  type="text"
                  placeholder="e.g. Master NestJS Dependency Injections"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-sm focus:outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Target Completion Date</label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={e => setNewTargetDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-sm focus:outline-none text-slate-200 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Link Topics (Select multiple)</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-950/40 border border-slate-800/80 rounded-lg scrollbar-thin">
                  {topics.map(t => (
                    <div
                      key={t.id}
                      onClick={() => toggleTopicSelection(t.id)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 select-none ${
                        selectedTopicIds.includes(t.id)
                          ? 'bg-purple-600/10 border-purple-500/50 text-purple-300'
                          : 'bg-transparent border-slate-800/80 hover:bg-slate-900/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTopicIds.includes(t.id)}
                        readOnly
                        className="rounded accent-purple-500 cursor-pointer pointer-events-none"
                      />
                      <span className="truncate">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer text-center text-sm border border-slate-700/50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateGoal}
                  disabled={!newTitle.trim() || !newTargetDate}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 disabled:border-slate-800/80 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors border border-transparent disabled:border text-sm"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        ) : selectedGoal ? (
          <div className="flex-1 flex flex-col p-6 space-y-6 max-w-3xl w-full mx-auto">
            {/* Completion metrics board */}
            <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="space-y-1.5 text-center md:text-left">
                <h2 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
                  <Award className="text-amber-400" size={18} />
                  Your Study Progress
                </h2>
                <p className="text-xs text-slate-500">
                  Track and complete targets to stay ready for upcoming interviews.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-200">
                    {completedCount} / {goals.length}
                  </span>
                  <span className="text-xs text-slate-500 block">goals completed</span>
                </div>
                <div className="w-14 h-14 rounded-full border-4 border-slate-850 flex items-center justify-center text-xs font-black bg-slate-950 shadow-inner relative">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent border-r-transparent rotate-45 animate-pulse"></div>
                  {completionPercentage}%
                </div>
              </div>
            </div>

            {/* Goal details card workspace */}
            <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/25 font-bold uppercase tracking-wider">
                      Study Target
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={12} />
                      Target: {new Date(selectedGoal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h1 className={`text-xl md:text-2xl font-bold leading-snug ${
                    selectedGoal.completed ? 'text-slate-500 line-through' : 'text-slate-100'
                  }`}>
                    {selectedGoal.title}
                  </h1>
                </div>

                <button
                  onClick={() => handleDeleteGoal(selectedGoal.id)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-750"
                  title="Delete Goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Connected Topics info */}
              {(selectedGoal.topics || []).length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Linked Study Topics
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedGoal.topics || []).map(t => (
                      <span key={t.id} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-850 font-medium">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Complete action bar */}
              <div className="pt-4 border-t border-slate-900/60 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 font-medium">
                  {selectedGoal.completed ? 'Target marked as completed!' : 'Still working on this goal?'}
                </span>
                <button
                  onClick={() => handleToggleGoal(selectedGoal.id)}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 border ${
                    selectedGoal.completed
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-transparent'
                  }`}
                >
                  {selectedGoal.completed ? (
                    <>
                      <Square size={12} />
                      Mark Uncompleted
                    </>
                  ) : (
                    <>
                      <CheckSquare size={12} />
                      Mark Completed
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 animate-pulse">
              <Target size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-300">No Target Goal Selected</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Select a target milestone from the sidebar or click "Set New Goal" to schedule your prep tracker.
              </p>
            </div>
          </div>
        )}
      </div>
      <Modal {...modal} onClose={() => setModal(p => ({ ...p, isOpen: false }))} />
    </div>
  );
};

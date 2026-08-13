import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchQuestionsApi,
  createQuestionApi,
  submitAnswerApi,
  fetchQuestionPracticesApi,
  deleteQuestionApi
} from '../api/questions';
import type { Question, Answer, Difficulty } from '../api/questions';
import type { Topic, Tag } from '../../notes/api/notes';
import { fetchTopicsApi, createTopicApi } from '../../topics/api/topics';
import { fetchTagsApi } from '../../tags/api/tags';
import { Search, Plus, Save, BookOpen, MessageSquare, Loader2, ArrowLeft, CheckCircle, Target, Trash2, X } from 'lucide-react';
import { Dropdown } from '../../../components/ui/Dropdown';
import { addToRevisionApi, RevisionItemType } from '../../revision/api/revision';
import { Modal } from '../../../components/ui/Modal';

export const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [practices, setPractices] = useState<Answer[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTopicId, setNewTopicId] = useState('');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm' | 'error' | 'success';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Custom Question Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('MEDIUM');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTagsList, setNewTagsList] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState('');

  // Answer Practicing Form
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const navigate = useNavigate();

  const loadQuestions = async () => {
    try {
      const [questionsData, topicsData, tagsData] = await Promise.all([
        fetchQuestionsApi(),
        fetchTopicsApi(),
        fetchTagsApi()
      ]);
      setQuestions(questionsData);
      setTopics(topicsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load questions', error);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length >= 3 || searchQuery.trim().length === 0) {
        setDebouncedSearchQuery(searchQuery);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const selectQuestion = async (q: Question) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowAddForm(false);
    try {
      const history = await fetchQuestionPracticesApi(q.id);
      setPractices(history);
    } catch {
      setPractices([]);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newTitle.trim()) return;
    const tagNames = newTagsList;
    try {
      const created = await createQuestionApi({
        title: newTitle,
        description: newDesc,
        difficulty: newDifficulty,
        tagNames,
        topicId: newTopicId || undefined,
      });
      setQuestions(prev => [created, ...prev]);
      selectQuestion(created);
      setNewTitle('');
      setNewDesc('');
      setNewTagsList([]);
      setNewTopicId('');
      setShowAddForm(false);

      const updatedTags = await fetchTagsApi();
      setTags(updatedTags);
    } catch (error) {
      console.error('Failed to create question', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;
    setIsSubmittingAnswer(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const res = await submitAnswerApi(selectedQuestion.id, userAnswer);
      setPractices(prev => [res, ...prev]);
      setUserAnswer('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to submit practicing answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      q.title.toLowerCase().includes(query) ||
      (q.description && q.description.toLowerCase().includes(query)) ||
      q.tags.some(tag => tag.name.toLowerCase().includes(query));

    const matchesTopic = !selectedTopicFilter || q.topic?.id === selectedTopicFilter;
    const matchesTag = !selectedTagFilter || q.tags.some(tag => tag.id === selectedTagFilter);
    const matchesDifficulty = !selectedDifficultyFilter || q.difficulty === selectedDifficultyFilter;

    return matchesSearch && matchesTopic && matchesTag && matchesDifficulty;
  });

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'HARD':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-slate-900/40 border-r border-slate-800/80 flex flex-col h-auto md:h-screen">
        {/* Header / Brand with back navigation */}
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
              Practice Center
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/goals')}
              title="Study Goals"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
            >
              <Target size={16} />
            </button>
            <button
              onClick={() => navigate('/revision')}
              title="Revision Deck"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <BookOpen size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search questions..."
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
        <div className="px-4 pt-2 pb-3 border-b border-slate-900/50 space-y-1.5">
          <Dropdown
            value={selectedTopicFilter}
            onChange={setSelectedTopicFilter}
            options={[
              { value: '', label: 'All Topics' },
              ...topics.map(t => ({ value: t.id, label: t.name })),
            ]}
            placeholder="All Topics"
          />

          <Dropdown
            value={selectedTagFilter}
            onChange={setSelectedTagFilter}
            options={[
              { value: '', label: 'All Tags' },
              ...tags.map(t => ({ value: t.id, label: `#${t.name}` })),
            ]}
            placeholder="All Tags"
          />

          <Dropdown
            value={selectedDifficultyFilter}
            onChange={setSelectedDifficultyFilter}
            options={[
              { value: '', label: 'All Difficulties' },
              { value: 'EASY', label: 'Easy' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HARD', label: 'Hard' },
            ]}
            placeholder="All Difficulties"
          />
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No questions found
            </div>
          ) : (
            filteredQuestions.map(q => (
              <div
                key={q.id}
                onClick={() => selectQuestion(q)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                  selectedQuestion?.id === q.id && !showAddForm
                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800/40'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-sm text-slate-200 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {q.title}
                  </h4>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full border ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    {q.topic && (
                      <span className="text-purple-400 font-semibold truncate max-w-[80px]">
                        {q.topic.name}
                      </span>
                    )}
                  </div>
                  {q.tags.length > 0 && (
                    <span className="text-slate-500 max-w-[80px] truncate">
                      #{q.tags[0].name}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Question Button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-sm"
          >
            <Plus size={16} />
            Create Question
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen bg-slate-950 overflow-y-auto">
        {showAddForm ? (
          <div className="max-w-2xl w-full mx-auto p-6 space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Create Practice Question
            </h2>
            <div className="space-y-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Explain Event Loop in Node.js"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-sm focus:outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Difficulty</label>
                <Dropdown
                  value={newDifficulty}
                  onChange={val => setNewDifficulty(val as Difficulty)}
                  options={[
                    { value: 'EASY', label: 'EASY' },
                    { value: 'MEDIUM', label: 'MEDIUM' },
                    { value: 'HARD', label: 'HARD' },
                  ]}
                  placeholder="Select Difficulty"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-slate-400">Topic</label>
                {newTopicId ? (
                  <div className="flex items-center justify-between bg-slate-950/20 border border-slate-800/80 px-3 py-1.5 rounded-xl w-full text-xs text-purple-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-slate-500" />
                      Topic: {topics.find(t => t.id === newTopicId)?.name || newTopicId}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewTopicId('')}
                      className="text-slate-500 hover:text-red-400 font-black cursor-pointer text-xs px-1 hover:bg-slate-850 rounded"
                      title="Remove Topic"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-1.5">
                    <div className="flex items-center gap-2 bg-slate-950/20 border border-slate-800/80 px-3 py-1.5 rounded-xl w-full">
                      <BookOpen size={12} className="text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={topicSearch}
                        onChange={e => setTopicSearch(e.target.value)}
                        placeholder="Search or type new topic..."
                        className="bg-transparent text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none flex-1 min-w-0"
                      />
                    </div>

                    {topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold self-center mr-1">Suggestions:</span>
                        {topics
                          .filter(t => t.name.toLowerCase().includes(topicSearch.toLowerCase().trim()))
                          .map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                setNewTopicId(t.id);
                                setTopicSearch('');
                              }}
                              className="px-2 py-0.5 bg-slate-900/50 hover:bg-purple-950/20 hover:border-purple-500/30 text-[10px] text-slate-450 hover:text-purple-400 border border-slate-800/80 rounded-full transition-colors cursor-pointer"
                            >
                              +{t.name}
                            </button>
                          ))}
                      </div>
                    )}

                    {topicSearch.trim() && !topics.some(t => t.name.toLowerCase() === topicSearch.toLowerCase().trim()) && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            const name = topicSearch.trim();
                            try {
                              const created = await createTopicApi(name);
                              setTopics(prev => [...prev, created]);
                              setNewTopicId(created.id);
                              setTopicSearch('');
                            } catch (error: any) {
                              setModal({
                                isOpen: true,
                                title: 'Error',
                                message: error.message || 'Failed to create topic.',
                                type: 'error',
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-[10px] text-emerald-400 hover:text-emerald-350 border border-emerald-500/20 rounded-full transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>+ Create topic "{topicSearch.trim()}"</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description / Practice Prompt</label>
                <textarea
                  placeholder="Explain the queue systems, microtasks, macrotasks, and libuv..."
                  rows={4}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-sm focus:outline-none text-slate-200"
                />
              </div>

               <div className="space-y-2 relative">
                 <label className="text-xs font-semibold text-slate-400">Tags</label>
                 <div className="flex items-center gap-2 bg-slate-950/20 border border-slate-800/80 px-3 py-1.5 rounded-xl w-full">
                   <input
                     type="text"
                     value={newTagInput}
                     onChange={e => setNewTagInput(e.target.value)}
                     onKeyDown={e => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         const trimmed = newTagInput.trim().toLowerCase();
                         if (trimmed && !newTagsList.includes(trimmed)) {
                           setNewTagsList(prev => [...prev, trimmed]);
                         }
                         setNewTagInput('');
                       }
                     }}
                     placeholder="Type tag..."
                     className="bg-transparent text-xs text-slate-300 placeholder:text-slate-750 focus:outline-none flex-1 min-w-0"
                   />
                   <button
                     type="button"
                     onClick={() => {
                       const trimmed = newTagInput.trim().toLowerCase();
                       if (trimmed && !newTagsList.includes(trimmed)) {
                         setNewTagsList(prev => [...prev, trimmed]);
                       }
                       setNewTagInput('');
                     }}
                     className="text-xs text-purple-400 hover:text-purple-300 font-bold px-1 hover:bg-slate-850 rounded shrink-0 cursor-pointer"
                   >
                     +
                   </button>
                 </div>

                 {newTagInput.trim() && (
                   <div className="absolute left-0 right-0 top-[60px] bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-55 max-h-48 overflow-y-auto p-1.5 space-y-0.5 backdrop-blur-md">
                     {tags
                       .filter(t => t.name.toLowerCase().includes(newTagInput.toLowerCase().trim()) && !newTagsList.includes(t.name))
                       .map(t => (
                         <button
                           key={t.id}
                           type="button"
                           onClick={() => {
                             setNewTagsList(prev => [...prev, t.name]);
                             setNewTagInput('');
                           }}
                           className="w-full text-left px-2.5 py-1.5 hover:bg-purple-600/10 text-xs text-purple-400 hover:text-purple-350 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                         >
                           <span>#{t.name}</span>
                           <span className="text-[9px] text-slate-500 font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">Existing Tag</span>
                         </button>
                       ))}
                     {!tags.some(t => t.name.toLowerCase() === newTagInput.toLowerCase().trim()) && (
                       <button
                         type="button"
                         onClick={() => {
                           const trimmed = newTagInput.trim().toLowerCase();
                           if (trimmed && !newTagsList.includes(trimmed)) {
                             setNewTagsList(prev => [...prev, trimmed]);
                           }
                           setNewTagInput('');
                         }}
                         className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-600/10 text-xs text-emerald-400 hover:text-emerald-350 rounded-lg transition-colors flex items-center justify-between cursor-pointer border-t border-slate-900/50 mt-1"
                       >
                         <span>+ Create new tag "{newTagInput.trim().toLowerCase()}"</span>
                         <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">New Tag</span>
                       </button>
                     )}
                   </div>
                 )}

                 {newTagsList.length > 0 && (
                   <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                     {newTagsList.map(tag => (
                       <span key={tag} className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-900 border border-slate-850/80 rounded-full text-[10px] text-purple-400 font-bold">
                         #{tag}
                         <button
                           type="button"
                           onClick={() => setNewTagsList(prev => prev.filter(t => t !== tag))}
                           className="hover:text-red-400 font-black cursor-pointer text-[10px]"
                         >
                           ×
                         </button>
                       </span>
                     ))}
                   </div>
                 )}

                 {tags.filter(t => !newTagsList.includes(t.name)).length > 0 && (
                   <div className="flex flex-wrap gap-1 pt-1">
                     <span className="text-[10px] text-slate-500 font-semibold self-center mr-1">Suggestions:</span>
                     {tags.filter(t => !newTagsList.includes(t.name)).map(t => (
                       <button
                         key={t.id}
                         type="button"
                         onClick={() => setNewTagsList(prev => [...prev, t.name])}
                         className="px-2 py-0.5 bg-slate-900/50 hover:bg-purple-950/20 hover:border-purple-500/30 text-[10px] text-slate-450 hover:text-purple-400 border border-slate-800/80 rounded-full transition-colors cursor-pointer"
                       >
                         +{t.name}
                       </button>
                     ))}
                   </div>
                 )}
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
                  onClick={handleCreateQuestion}
                  disabled={!newTitle.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 disabled:border-slate-800/80 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors border border-transparent disabled:border text-sm"
                >
                  Create Question
                </button>
              </div>
            </div>
          </div>
        ) : selectedQuestion ? (
          <div className="flex-1 flex flex-col p-6 space-y-6 max-w-4xl w-full mx-auto">
            {/* Question Details */}
            <div className="space-y-3 border-b border-slate-900 pb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                  {selectedQuestion.topic && (
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      {selectedQuestion.topic.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      try {
                        await addToRevisionApi(selectedQuestion.id, RevisionItemType.QUESTION);
                        setModal({
                          isOpen: true,
                          title: 'Success',
                          message: 'Question added to revision deck!',
                          type: 'success',
                        });
                      } catch (error: any) {
                        setModal({
                          isOpen: true,
                          title: 'Failed',
                          message: error.message || 'Failed to add to revisions',
                          type: 'error',
                        });
                      }
                    }}
                    className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-semibold rounded-lg text-xs transition-colors border border-purple-500/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen size={12} />
                    Queue Revision
                  </button>
                  <button
                    onClick={() => {
                      const titleText = selectedQuestion?.title ? `"${selectedQuestion.title}"` : 'this question';
                      setModal({
                        isOpen: true,
                        title: 'Delete Question',
                        message: `Are you sure you want to permanently delete the practice question ${titleText}? This action cannot be undone.`,
                        type: 'confirm',
                        onConfirm: async () => {
                          try {
                            await deleteQuestionApi(selectedQuestion.id);
                            setQuestions(prev => prev.filter(q => q.id !== selectedQuestion.id));
                            setSelectedQuestion(null);
                          } catch (error: any) {
                            setModal({
                              isOpen: true,
                              title: 'Error',
                              message: error.message || 'Failed to delete question.',
                              type: 'error',
                            });
                          }
                        }
                      });
                    }}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer border border-transparent hover:border-slate-800/80"
                    title="Delete Question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight">
                {selectedQuestion.title}
              </h1>
              {selectedQuestion.description && (
                <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedQuestion.description}
                </p>
              )}
            </div>

            {/* Submit practice area */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-purple-400" />
                  Your practice answer
                </label>
                {submitSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Practiced recorded!
                  </span>
                )}
              </div>
              
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                  {submitError}
                </div>
              )}

              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Draft your practicing response here. Include code blocks, methodologies, and explanations..."
                rows={8}
                className="w-full p-4 bg-slate-900/30 border border-slate-800/80 focus:border-purple-500/50 focus:outline-none rounded-xl text-slate-200 placeholder:text-slate-700 leading-relaxed text-sm md:text-base resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmittingAnswer || !userAnswer.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 disabled:border-slate-800/80 disabled:cursor-not-allowed disabled:shadow-none text-white font-semibold rounded-lg text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-transparent disabled:border"
                >
                  {isSubmittingAnswer ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save size={12} />
                      Submit Answer
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Practicing History */}
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} className="text-pink-400" />
                Practice history ({practices.length})
              </h3>
              
              {practices.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-600 font-medium">
                  No practice records yet. Write and submit your first answer above!
                </div>
              ) : (
                <div className="space-y-4">
                  {practices.map(ans => (
                    <div key={ans.id} className="bg-slate-900/20 border border-slate-800/50 rounded-xl p-5 space-y-3 relative hover:border-slate-800 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-xs text-slate-500 font-medium">
                          Submitted on {new Date(ans.createdAt).toLocaleDateString()} at {new Date(ans.createdAt).toLocaleTimeString()}
                        </p>
                        {ans.score !== undefined && ans.score !== null && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Score: {ans.score}/100
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {ans.userAnswer}
                      </p>
                      
                      {/* AI Feedbacks details block wrapper */}
                      <div className="mt-3 p-4 bg-purple-950/15 border border-purple-500/10 rounded-xl text-xs space-y-2">
                        <span className="font-bold text-purple-400 flex items-center gap-1.5 text-xs">
                          🤖 AI Evaluation:
                        </span>
                        {ans.feedback ? (
                          <div className="space-y-2 text-slate-350 leading-relaxed">
                            {ans.feedback.split('\n').map((line, idx) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;
                              if (trimmed.startsWith('###')) {
                                return (
                                  <h4 key={idx} className="font-bold text-purple-300 text-sm mt-3 mb-1 first:mt-0">
                                    {trimmed.replace('###', '').trim()}
                                  </h4>
                                );
                              }
                              if (trimmed.startsWith('####')) {
                                return (
                                  <h5 key={idx} className="font-bold text-slate-200 mt-2">
                                    {trimmed.replace('####', '').trim()}
                                  </h5>
                                );
                              }
                              if (trimmed.startsWith('**Score:**')) {
                                return null; // We already show the badge
                              }
                              if (trimmed.startsWith('-')) {
                                return (
                                  <div key={idx} className="flex gap-2 pl-2">
                                    <span className="text-purple-500 font-bold">•</span>
                                    <span>{trimmed.substring(1).trim().replace(/`/g, '')}</span>
                                  </div>
                                );
                              }
                              return <p key={idx}>{trimmed}</p>;
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">
                            No feedback generated yet.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <BookOpen size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-300">No Question Selected</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Select a practice question from the explorer or create a custom practicing challenge to start your prep.
              </p>
            </div>
          </div>
        )}
      </div>
      <Modal {...modal} onClose={() => setModal(p => ({ ...p, isOpen: false }))} />
    </div>
  );
};

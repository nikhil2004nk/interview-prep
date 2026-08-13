import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag as TagIcon, BookOpen, Plus, Trash2, Edit2, Check, X, Search, FileText, HelpCircle, Target } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { Topic, Tag } from '../../notes/api/notes';
import { fetchTopicsPaginatedApi, createTopicApi, updateTopicApi, deleteTopicApi } from '../../topics/api/topics';
import { fetchTagsPaginatedApi, createTagApi, updateTagApi, deleteTagApi } from '../../tags/api/tags';

const ITEMS_PER_PAGE = 6;

export const TaxonomyPage: React.FC = () => {
  const navigate = useNavigate();

  // Data states
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Pagination totals
  const [totalTopics, setTotalTopics] = useState(0);
  const [totalTags, setTotalTags] = useState(0);

  // Page counters
  const [topicPage, setTopicPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);

  // Search input & debounced states
  const [topicSearch, setTopicSearch] = useState('');
  const [debouncedTopicSearch, setDebouncedTopicSearch] = useState('');

  const [tagSearch, setTagSearch] = useState('');
  const [debouncedTagSearch, setDebouncedTagSearch] = useState('');

  // Editing states
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDesc, setEditTopicDesc] = useState('');

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');

  // Creation states (in Modals)
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [isBulkTopic, setIsBulkTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [bulkTopicText, setBulkTopicText] = useState('');

  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [isBulkTag, setIsBulkTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [bulkTagText, setBulkTagText] = useState('');

  // Modal
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm' | 'error' | 'success';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  // Debouncing effect for topics
  useEffect(() => {
    const timer = setTimeout(() => {
      if (topicSearch.trim().length >= 3 || topicSearch.trim().length === 0) {
        setDebouncedTopicSearch(topicSearch);
        setTopicPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [topicSearch]);

  // Debouncing effect for tags
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tagSearch.trim().length >= 3 || tagSearch.trim().length === 0) {
        setDebouncedTagSearch(tagSearch);
        setTagPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tagSearch]);

  // Load Topics from Backend
  const loadTopics = async () => {
    setTopicsLoading(true);
    try {
      const res = await fetchTopicsPaginatedApi(topicPage, ITEMS_PER_PAGE, debouncedTopicSearch);
      setTopics(res.items);
      setTotalTopics(res.total);
    } catch (error) {
      console.error('Failed to load topics', error);
    } finally {
      setTopicsLoading(false);
    }
  };

  // Load Tags from Backend
  const loadTags = async () => {
    setTagsLoading(true);
    try {
      const res = await fetchTagsPaginatedApi(tagPage, ITEMS_PER_PAGE, debouncedTagSearch);
      setTags(res.items);
      setTotalTags(res.total);
    } catch (error) {
      console.error('Failed to load tags', error);
    } finally {
      setTagsLoading(false);
    }
  };

  // Trigger loads when page or debounced query changes
  useEffect(() => {
    loadTopics();
  }, [topicPage, debouncedTopicSearch]);

  useEffect(() => {
    loadTags();
  }, [tagPage, debouncedTagSearch]);

  // Topics CRUD Actions
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBulkTopic) {
      const names = bulkTopicText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
      if (names.length === 0) return;
      try {
        const results = await Promise.all(names.map(name => createTopicApi(name)));
        setBulkTopicText('');
        setShowNewTopicForm(false);
        setModal({
          isOpen: true,
          title: 'Bulk Topics Created',
          message: `Successfully created ${results.length} topics.`,
          type: 'success',
        });
        loadTopics();
      } catch (error: any) {
        setModal({
          isOpen: true,
          title: 'Bulk Creation',
          message: 'Bulk creation completed with warning: Some topics might already exist.',
          type: 'error',
        });
        loadTopics();
      }
    } else {
      if (!newTopicName.trim()) return;
      try {
        const created = await createTopicApi(newTopicName.trim(), newTopicDesc.trim() || undefined);
        setNewTopicName('');
        setNewTopicDesc('');
        setShowNewTopicForm(false);
        setModal({
          isOpen: true,
          title: 'Success',
          message: `Topic "${created.name}" created successfully.`,
          type: 'success',
        });
        loadTopics();
      } catch (error: any) {
        setModal({
          isOpen: true,
          title: 'Creation Failed',
          message: error.message || 'Failed to create topic.',
          type: 'error',
        });
      }
    }
  };

  const handleUpdateTopic = async (id: string) => {
    if (!editTopicName.trim()) return;
    try {
      const updated = await updateTopicApi(id, editTopicName.trim(), editTopicDesc.trim() || undefined);
      setTopics(prev => prev.map(t => (t.id === id ? updated : t)));
      setEditingTopicId(null);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Update Failed',
        message: error.message || 'Failed to update topic.',
        type: 'error',
      });
    }
  };

  const handleDeleteTopic = (id: string) => {
    const target = topics.find(t => t.id === id);
    const titleText = target ? `"${target.name}"` : 'this topic';
    setModal({
      isOpen: true,
      title: 'Delete Topic',
      message: `Are you sure you want to permanently delete the topic ${titleText}? Any assigned notes or questions will lose their topic classification.`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteTopicApi(id);
          loadTopics();
        } catch (error: any) {
          setModal({
            isOpen: true,
            title: 'Delete Failed',
            message: error.message || 'Failed to delete topic.',
            type: 'error',
          });
        }
      },
    });
  };

  // Tags CRUD Actions
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBulkTag) {
      const names = bulkTagText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
      if (names.length === 0) return;
      try {
        const results = await Promise.all(names.map(name => createTagApi(name)));
        setBulkTagText('');
        setShowNewTagForm(false);
        setModal({
          isOpen: true,
          title: 'Bulk Tags Created',
          message: `Successfully created ${results.length} tags.`,
          type: 'success',
        });
        loadTags();
      } catch (error: any) {
        setModal({
          isOpen: true,
          title: 'Bulk Creation',
          message: 'Bulk creation completed with warning: Some tags might already exist.',
          type: 'error',
        });
        loadTags();
      }
    } else {
      if (!newTagName.trim()) return;
      try {
        const created = await createTagApi(newTagName.trim());
        setNewTagName('');
        setShowNewTagForm(false);
        setModal({
          isOpen: true,
          title: 'Success',
          message: `Tag "#${created.name}" created successfully.`,
          type: 'success',
        });
        loadTags();
      } catch (error: any) {
        setModal({
          isOpen: true,
          title: 'Creation Failed',
          message: error.message || 'Failed to create tag.',
          type: 'error',
        });
      }
    }
  };

  const handleUpdateTag = async (id: string) => {
    if (!editTagName.trim()) return;
    try {
      const updated = await updateTagApi(id, editTagName.trim());
      setTags(prev => prev.map(t => (t.id === id ? updated : t)));
      setEditingTagId(null);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Update Failed',
        message: error.message || 'Failed to update tag.',
        type: 'error',
      });
    }
  };

  const handleDeleteTag = (id: string) => {
    const target = tags.find(t => t.id === id);
    const titleText = target ? `"#${target.name}"` : 'this tag';
    setModal({
      isOpen: true,
      title: 'Delete Tag',
      message: `Are you sure you want to permanently delete the tag ${titleText}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteTagApi(id);
          loadTags();
        } catch (error: any) {
          setModal({
            isOpen: true,
            title: 'Delete Failed',
            message: error.message || 'Failed to delete tag.',
            type: 'error',
          });
        }
      },
    });
  };

  // Pagination calculation
  const totalTopicPages = Math.ceil(totalTopics / ITEMS_PER_PAGE) || 1;
  const totalTagPages = Math.ceil(totalTags / ITEMS_PER_PAGE) || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.25);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.4);
        }
      `}</style>
      {/* Header Navigator */}
      <header className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-lg">
            Manage Taxonomy
          </span>
        </div>

        <div className="flex items-center gap-1.5">
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
      </header>

      {/* Main grids */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 overflow-y-auto">
        {/* TOPICS SECTION */}
        <section className="flex flex-col bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <BookOpen size={18} className="text-purple-400" />
              Topics ({totalTopics})
            </h2>
            <button
              onClick={() => setShowNewTopicForm(true)}
              className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-455 border border-purple-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={12} /> Add Topic
            </button>
          </div>

          {/* Search topics */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search topics (min 3 chars)..."
              value={topicSearch}
              onChange={e => setTopicSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
            {topicSearch && (
              <button
                onClick={() => setTopicSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-355 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Topics List */}
          <div className="space-y-2 pr-1 h-[320px] overflow-y-auto custom-scrollbar">
            {topicsLoading ? (
              <div className="text-center text-xs text-slate-500 py-6">Loading topics...</div>
            ) : topics.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-6">No topics found</div>
            ) : (
              topics.map(t => (
                <div
                  key={t.id}
                  className="p-4 bg-slate-950/30 border border-slate-855/60 hover:border-slate-800 rounded-xl flex flex-col gap-2 transition-all"
                >
                  {editingTopicId === t.id ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Name</label>
                        <input
                          type="text"
                          value={editTopicName}
                          onChange={e => setEditTopicName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 focus:border-purple-500/50 rounded-lg text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Description</label>
                        <textarea
                          value={editTopicDesc}
                          onChange={e => setEditTopicDesc(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 bg-slate-955 border border-slate-800 focus:border-purple-500/50 rounded-lg text-xs text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTopicId(null)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => handleUpdateTopic(t.id)}
                          className="p-1 hover:bg-purple-950/40 rounded text-emerald-455 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Save Changes"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-slate-200">{t.name}</h3>
                        {t.description && (
                          <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingTopicId(t.id);
                            setEditTopicName(t.name);
                            setEditTopicDesc(t.description || '');
                          }}
                          className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-purple-400 transition-colors cursor-pointer"
                          title="Edit Topic"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(t.id)}
                          className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Topic"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Topic pagination controls */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-900/50 mt-auto shrink-0 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            <button
              disabled={topicPage === 1}
              onClick={() => setTopicPage(p => Math.max(p - 1, 1))}
              className="px-2.5 py-1.5 bg-slate-950/40 border border-slate-850 hover:bg-slate-900 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-slate-350 cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span>Page {topicPage} of {totalTopicPages}</span>
            <button
              disabled={topicPage === totalTopicPages}
              onClick={() => setTopicPage(p => Math.min(p + 1, totalTopicPages))}
              className="px-2.5 py-1.5 bg-slate-955/40 border border-slate-855 hover:bg-slate-900 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-slate-355 cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </section>

        {/* TAGS SECTION */}
        <section className="flex flex-col bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <TagIcon size={18} className="text-pink-400" />
              Tags ({totalTags})
            </h2>
            <button
              onClick={() => setShowNewTagForm(true)}
              className="px-3 py-1.5 bg-pink-650/10 hover:bg-pink-600/20 text-pink-400 border border-pink-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus size={12} /> Add Tag
            </button>
          </div>

          {/* Search tags */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search tags (min 3 chars)..."
              value={tagSearch}
              onChange={e => setTagSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-955 border border-pink-500/50 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
            {tagSearch && (
              <button
                onClick={() => setTagSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-505 hover:text-slate-355 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tags list */}
          <div className="space-y-2 pr-1 h-[320px] overflow-y-auto custom-scrollbar">
            {tagsLoading ? (
              <div className="text-center text-xs text-slate-500 py-6">Loading tags...</div>
            ) : tags.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-6">No tags found</div>
            ) : (
              tags.map(t => (
                <div
                  key={t.id}
                  className="p-3.5 bg-slate-950/30 border border-slate-850/60 hover:border-slate-800 rounded-xl flex items-center justify-between gap-3 transition-all"
                >
                  {editingTagId === t.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editTagName}
                        onChange={e => setEditTagName(e.target.value)}
                        className="bg-slate-955 border border-slate-800 focus:border-pink-500/50 rounded px-2.5 py-1 text-xs text-slate-200 flex-1 focus:outline-none"
                      />
                      <button
                        onClick={() => setEditingTagId(null)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors cursor-pointer shrink-0"
                      >
                        <X size={12} />
                      </button>
                      <button
                        onClick={() => handleUpdateTag(t.id)}
                        className="p-1 hover:bg-pink-950/40 rounded text-emerald-450 transition-colors cursor-pointer shrink-0"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-300">#{t.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingTagId(t.id);
                            setEditTagName(t.name);
                          }}
                          className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-pink-400 transition-colors cursor-pointer"
                          title="Edit Tag"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(t.id)}
                          className="p-1 hover:bg-slate-900 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Tag"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Tag pagination controls */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-900/50 mt-auto shrink-0 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            <button
              disabled={tagPage === 1}
              onClick={() => setTopicPage(p => Math.max(p - 1, 1))}
              className="px-2.5 py-1.5 bg-slate-950/40 border border-slate-850 hover:bg-slate-900 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-slate-350 cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span>Page {tagPage} of {totalTagPages}</span>
            <button
              disabled={tagPage === totalTagPages}
              onClick={() => setTagPage(p => Math.min(p + 1, totalTagPages))}
              className="px-2.5 py-1.5 bg-slate-955/40 border border-slate-855 hover:bg-slate-900 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-slate-355 cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </section>
      </main>

      {/* NEW TOPIC MODAL */}
      <Modal
        isOpen={showNewTopicForm}
        title="Create New Topic"
        type="confirm"
        onClose={() => setShowNewTopicForm(false)}
      >
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="modalBulkTopic"
              checked={isBulkTopic}
              onChange={e => setIsBulkTopic(e.target.checked)}
              className="rounded border-slate-800 accent-purple-600 cursor-pointer"
            />
            <label htmlFor="modalBulkTopic" className="text-xs text-slate-400 font-semibold cursor-pointer">Bulk Creation Mode</label>
          </div>

          {isBulkTopic ? (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Topics list (one per line)</label>
              <textarea
                placeholder="e.g.&#10;Node Streams&#10;React Virtual DOM&#10;System Caching"
                value={bulkTopicText}
                onChange={e => setBulkTopicText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/50 leading-relaxed"
                required
              />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Node.js Streams"
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-955/60 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  placeholder="Write a brief overview of this subject..."
                  value={newTopicDesc}
                  onChange={e => setNewTopicDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-955/60 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setShowNewTopicForm(false)}
              className="px-4 py-2 bg-slate-950/50 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* NEW TAG MODAL */}
      <Modal
        isOpen={showNewTagForm}
        title="Create New Tag"
        type="confirm"
        onClose={() => setShowNewTagForm(false)}
      >
        <form onSubmit={handleCreateTag} className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="modalBulkTag"
              checked={isBulkTag}
              onChange={e => setIsBulkTag(e.target.checked)}
              className="rounded border-slate-800 accent-pink-600 cursor-pointer"
            />
            <label htmlFor="modalBulkTag" className="text-xs text-slate-400 font-semibold cursor-pointer">Bulk Creation Mode</label>
          </div>

          {isBulkTag ? (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">Tags list (one per line)</label>
              <textarea
                placeholder="e.g.&#10;async&#10;typeorm&#10;sql-tuning"
                value={bulkTagText}
                onChange={e => setBulkTagText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-pink-500/50 leading-relaxed"
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Tag Name</label>
              <input
                type="text"
                placeholder="e.g. async-flow"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-955/60 border border-slate-855 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-pink-500/50"
                required
              />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setShowNewTagForm(false)}
              className="px-4 py-2 bg-slate-950/50 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation modal */}
      <Modal {...modal} onClose={() => setModal(p => ({ ...p, isOpen: false }))} />
    </div>
  );
};

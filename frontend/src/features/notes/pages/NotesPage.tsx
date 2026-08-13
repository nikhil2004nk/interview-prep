import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotesApi, createNoteApi, updateNoteApi, deleteNoteApi } from '../api/notes';
import type { Note, Topic, Tag } from '../api/notes';
import { fetchTopicsApi, createTopicApi } from '../../topics/api/topics';
import { fetchTagsApi } from '../../tags/api/tags';
import { Search, Plus, Trash2, Save, FileText, Tag as TagIcon, LogOut, Loader2, HelpCircle, Target, BookOpen, LayoutGrid, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Dropdown } from '../../../components/ui/Dropdown';
import { addToRevisionApi, RevisionItemType } from '../../revision/api/revision';
import { Modal } from '../../../components/ui/Modal';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';

const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [topicId, setTopicId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const initialContentRef = useRef('');
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'confirm' | 'error' | 'success';
    onConfirm?: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const selectedNoteTagsSorted = selectedNote ? [...selectedNote.tags].map(t => t.name).sort().join(',') : '';
  const currentTagsSorted = [...tagsList].sort().join(',');
  // Strip HTML tags for empty-content check
  const contentTextOnly = content.replace(/<[^>]*>/g, '').trim();
  const hasChanges = selectedNote
    ? (title !== selectedNote.title || content !== initialContentRef.current || currentTagsSorted !== selectedNoteTagsSorted || topicId !== (selectedNote.topic?.id || ''))
    : (title.trim().length > 0 || contentTextOnly.length > 0 || tagsList.length > 0 || topicId.length > 0);

  const loadNotes = async () => {
    try {
      const [notesData, topicsData, tagsData] = await Promise.all([
        fetchNotesApi(),
        fetchTopicsApi(),
        fetchTagsApi()
      ]);
      setNotes(notesData);
      setTopics(topicsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Failed to load workspace data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length >= 3 || searchQuery.trim().length === 0) {
        setDebouncedSearchQuery(searchQuery);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    initialContentRef.current = note.content;
    setTagsList(note.tags.map(t => t.name));
    setTopicId(note.topic?.id || '');
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setTagsList([]);
    setTopicId('');
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !contentTextOnly) return;
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    const tagNames = tagsList;

    try {
      if (selectedNote) {
        const updated = await updateNoteApi(selectedNote.id, {
          title,
          content,
          tagNames,
          topicId: topicId || null,
        });
        setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
        setSelectedNote(updated);
      } else {
        const created = await createNoteApi({
          title,
          content,
          tagNames,
          topicId: topicId || undefined,
        });
        setNotes(prev => [created, ...prev]);
        setSelectedNote(created);
      }
      // Re-load tags to reflect new custom tags
      const updatedTags = await fetchTagsApi();
      setTags(updatedTags);

      setIsEditing(false);
      initialContentRef.current = content;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to save note', error);
      setSaveError(error.message || 'Failed to save note. Please verify backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    const target = notes.find(n => n.id === id);
    const titleText = target?.title ? `"${target.title}"` : 'this note';
    setModal({
      isOpen: true,
      title: 'Delete Note',
      message: `Are you sure you want to permanently delete the note ${titleText}? This action cannot be undone.`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteNoteApi(id);
          setNotes(prev => prev.filter(n => n.id !== id));
          if (selectedNote?.id === id) {
            setSelectedNote(null);
            setTitle('');
            setContent('');
            setTagsList([]);
          }
          const updatedTags = await fetchTagsApi();
          setTags(updatedTags);
        } catch (error) {
          console.error('Failed to delete note', error);
        }
      }
    });
  };

  const filteredNotes = notes.filter(note => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.name.toLowerCase().includes(query));

    const matchesTopic = !selectedTopicFilter || note.topic?.id === selectedTopicFilter;
    const matchesTag = !selectedTagFilter || note.tags.some(tag => tag.id === selectedTagFilter);

    return matchesSearch && matchesTopic && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 bg-slate-900/40 border-r border-slate-800/80 flex-col h-screen md:h-screen ${selectedNote || isEditing ? 'hidden md:flex' : 'flex'}`}>
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center font-bold text-sm">
              📚
            </div>
            <span className="font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Notes Workspace
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              title="Dashboard"
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => navigate('/questions')}
              title="Practice Center"
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-primary-400 transition-colors cursor-pointer"
            >
              <HelpCircle size={16} />
            </button>
            <button
              onClick={() => navigate('/goals')}
              title="Study Goals"
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-secondary-400 transition-colors cursor-pointer"
            >
              <Target size={16} />
            </button>
            <button
              onClick={() => navigate('/revision')}
              title="Revision Deck"
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
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
              placeholder="Search title, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-1.5 bg-slate-950/60 border border-slate-800/80 focus:border-primary-500/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
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
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              Loading notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No notes found
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => selectNote(note)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer group flex justify-between items-start ${
                  selectedNote?.id === note.id
                    ? 'bg-primary-600/10 border-primary-500/50 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800/40'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-sm truncate text-slate-200 group-hover:text-primary-400 transition-colors">
                    {note.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {stripHtml(note.content)}
                  </p>
                  {(note.tags.length > 0 || note.topic) && (
                    <div className="flex flex-wrap gap-1 pt-1.5 items-center">
                      {note.topic && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 font-semibold border border-primary-500/25">
                          {note.topic.name}
                        </span>
                      )}
                      {note.tags.map(t => (
                        <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Floating actions */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-900/20">
          <button
            onClick={handleNewNote}
            className="w-full py-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-lg shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-[11px]"
          >
            <Plus size={12} />
            Create Note
          </button>
        </div>
      </div>

      {/* Editor / Details view */}
      <div className={`flex-1 flex-col h-screen bg-slate-950 relative ${selectedNote || isEditing ? 'flex' : 'hidden md:flex'}`}>
        {selectedNote || isEditing ? (
          <div className="flex-1 flex flex-col p-3 space-y-2 overflow-y-auto">
            {/* Top Bar actions */}
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedNote(null);
                    setIsEditing(false);
                  }}
                  className="md:hidden p-1 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                </button>
                <FileText size={14} className="text-primary-400" />
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
                  {selectedNote ? 'Note Workspace' : 'Drafting Note'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                 {!isEditing && selectedNote ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        try {
                          await addToRevisionApi(selectedNote.id, RevisionItemType.NOTE);
                          setModal({
                            isOpen: true,
                            title: 'Success',
                            message: 'Note added to deck!',
                            type: 'success',
                          });
                        } catch (error: any) {
                          setModal({
                            isOpen: true,
                            title: 'Failed',
                            message: error.message || 'Error.',
                            type: 'error',
                          });
                        }
                      }}
                      className="px-2 py-1 bg-primary-600/10 hover:bg-primary-600/20 text-primary-400 font-semibold rounded text-[10px] transition-colors border border-primary-500/20 cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen size={10} />
                      Revision
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNote(null);
                        setTitle('');
                        setContent('');
                        setTagsList([]);
                        setTopicId('');
                        setIsEditing(false);
                      }}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-semibold rounded text-[10px] transition-colors border border-slate-800/80 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-slate-800/80"
                    >
                      Edit Note
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedNote(null);
                        setTitle('');
                        setContent('');
                        setTagsList([]);
                        setTopicId('');
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-colors border border-slate-800/80 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges || !title.trim() || !content.trim()}
                      className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800/80 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs shadow-md disabled:shadow-none border border-transparent disabled:border transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={12} />
                          Save Note
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs p-3 rounded-lg text-center animate-fade-in font-medium">
                ✓ Note saved successfully!
              </div>
            )}
            {saveError && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-xs p-3 rounded-lg text-center animate-shake font-medium">
                ⚠ {saveError}
              </div>
            )}

            {/* Guide Info */}
            {!selectedNote && (
              <div className="bg-primary-950/15 border border-primary-500/15 rounded-xl p-4 text-xs text-primary-300 space-y-1">
                <p className="font-semibold text-primary-200">💡 Drafting a new note</p>
                <p className="text-primary-400">Provide a title, enter tags separated by commas, write your notes, and then click "Save Note" to save it.</p>
              </div>
            )}


            {/* Input Form Fields */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <input
                type="text"
                value={title}
                disabled={!isEditing}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full text-2xl md:text-3xl font-extrabold bg-transparent text-slate-100 placeholder:text-slate-800 focus:outline-none border-b border-transparent focus:border-slate-800/50 pb-2"
              />

              {/* Tags & Topic — compact row */}
              <div className="flex flex-wrap items-start gap-x-4 gap-y-2 relative">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 min-w-0 relative">
                  {isEditing && (
                    <>
                      <div className="flex items-center gap-2 bg-slate-950/20 border border-slate-800/80 px-3 py-1 rounded-xl min-w-0">
                        <TagIcon size={12} className="text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = tagInput.trim().toLowerCase();
                              if (trimmed && !tagsList.includes(trimmed)) {
                                setTagsList(prev => [...prev, trimmed]);
                              }
                              setTagInput('');
                            }
                          }}
                          placeholder="Type tag..."
                          className="bg-transparent text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none flex-1 min-w-0 w-28"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = tagInput.trim().toLowerCase();
                            if (trimmed && !tagsList.includes(trimmed)) {
                              setTagsList(prev => [...prev, trimmed]);
                            }
                            setTagInput('');
                          }}
                          className="text-xs text-primary-400 hover:text-primary-300 font-bold px-1 hover:bg-slate-850 rounded shrink-0 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {tagInput.trim() && (
                        <div className="absolute left-0 top-[34px] w-72 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-55 max-h-48 overflow-y-auto p-1.5 space-y-0.5 backdrop-blur-md">
                          {tags
                            .filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase().trim()) && !tagsList.includes(t.name))
                            .map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setTagsList(prev => [...prev, t.name]);
                                  setTagInput('');
                                }}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-primary-600/10 text-xs text-primary-400 hover:text-primary-350 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span>#{t.name}</span>
                                <span className="text-[9px] text-slate-500 font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">Existing Tag</span>
                              </button>
                            ))}
                          {!tags.some(t => t.name.toLowerCase() === tagInput.toLowerCase().trim()) && (
                            <button
                              type="button"
                              onClick={() => {
                                const trimmed = tagInput.trim().toLowerCase();
                                if (trimmed && !tagsList.includes(trimmed)) {
                                  setTagsList(prev => [...prev, trimmed]);
                                }
                                setTagInput('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-600/10 text-xs text-emerald-400 hover:text-emerald-350 rounded-lg transition-colors flex items-center justify-between cursor-pointer border-t border-slate-900/50 mt-1"
                            >
                              <span>+ Create new tag "{tagInput.trim().toLowerCase()}"</span>
                              <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">New Tag</span>
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {tagsList.length > 0 ? (
                    tagsList.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-900 border border-slate-850/80 rounded-full text-[10px] text-primary-400 font-bold">
                        #{tag}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => setTagsList(prev => prev.filter(t => t !== tag))}
                            className="hover:text-red-400 font-black cursor-pointer text-[10px]"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  ) : !isEditing ? (
                    <span className="text-[10px] text-slate-600 italic">No tags</span>
                  ) : null}
                </div>

                {/* Divider */}
                {(tagsList.length > 0 || !isEditing) && (topicId || isEditing) && (
                  <div className="w-px h-5 bg-slate-800/80 self-center shrink-0 hidden sm:block" />
                )}

                {/* Topic */}
                <div className="relative min-w-0">
                  {topicId ? (
                    <div className="flex items-center gap-1.5 bg-slate-950/20 border border-slate-800/80 px-2.5 py-1 rounded-xl text-xs text-primary-400 font-semibold">
                      <BookOpen size={11} className="text-slate-500 shrink-0" />
                      <span className="truncate">{topics.find(t => t.id === topicId)?.name || topicId}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setTopicId('')}
                          className="text-slate-500 hover:text-red-400 font-black cursor-pointer text-[10px] px-0.5 hover:bg-slate-850 rounded shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : isEditing ? (
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-slate-950/20 border border-slate-800/80 px-3 py-1 rounded-xl">
                        <BookOpen size={12} className="text-slate-500 shrink-0" />
                        <input
                          type="text"
                          value={topicSearch}
                          onChange={e => setTopicSearch(e.target.value)}
                          placeholder="Search topic..."
                          className="bg-transparent text-xs text-slate-300 placeholder:text-slate-700 focus:outline-none flex-1 min-w-0 w-32"
                        />
                      </div>

                      {topicSearch.trim() && (
                        <div className="absolute left-0 top-[34px] w-72 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl z-55 max-h-48 overflow-y-auto p-1.5 space-y-0.5 backdrop-blur-md">
                          {topics
                            .filter(t => t.name.toLowerCase().includes(topicSearch.toLowerCase().trim()))
                            .map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  setTopicId(t.id);
                                  setTopicSearch('');
                                }}
                                className="w-full text-left px-2.5 py-1.5 hover:bg-primary-600/10 text-xs text-primary-400 hover:text-primary-350 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                              >
                                <span>{t.name}</span>
                                <span className="text-[9px] text-slate-500 font-semibold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">Existing Topic</span>
                              </button>
                            ))}
                          {!topics.some(t => t.name.toLowerCase() === topicSearch.toLowerCase().trim()) && (
                            <button
                              type="button"
                              onClick={async () => {
                                const name = topicSearch.trim();
                                try {
                                  const created = await createTopicApi(name);
                                  setTopics(prev => [...prev, created]);
                                  setTopicId(created.id);
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
                              className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-600/10 text-xs text-emerald-455 rounded-lg transition-colors flex items-center justify-between cursor-pointer border-t border-slate-900/50 mt-1"
                            >
                              <span>+ Create new topic "{topicSearch.trim()}"</span>
                              <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">New Topic</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600 italic">No topic</span>
                  )}
                </div>
              </div>

              {/* Suggestions row (edit mode only) */}
              {isEditing && (
                <div className="flex flex-wrap gap-1 items-center">
                  {tags.filter(t => !tagsList.includes(t.name)).length > 0 && (
                    <>
                      <span className="text-[10px] text-slate-500 font-semibold mr-0.5">Tags:</span>
                      {tags.filter(t => !tagsList.includes(t.name)).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTagsList(prev => [...prev, t.name])}
                          className="px-2 py-0.5 bg-slate-900/50 hover:bg-primary-950/20 hover:border-primary-500/30 text-[10px] text-slate-450 hover:text-primary-400 border border-slate-800/80 rounded-full transition-colors cursor-pointer"
                        >
                          +{t.name}
                        </button>
                      ))}
                    </>
                  )}
                  {!topicId && !topicSearch.trim() && topics.length > 0 && (
                    <>
                      <span className="text-[10px] text-slate-500 font-semibold ml-2 mr-0.5">Topics:</span>
                      {topics.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTopicId(t.id)}
                          className="px-2 py-0.5 bg-slate-900/50 hover:bg-primary-950/20 hover:border-primary-500/30 text-[10px] text-slate-450 hover:text-primary-400 border border-slate-800/80 rounded-full transition-colors cursor-pointer"
                        >
                          +{t.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              <RichTextEditor
                content={content}
                onChange={setContent}
                editable={isEditing}
                placeholder="Write down your technical findings, snippets, concepts, or interview notes..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <FileText size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-300">No Note Selected</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Select an existing note from the list, or create a new note to start writing.
              </p>
            </div>
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-primary-400 hover:text-primary-300 font-semibold rounded-lg text-sm border border-primary-500/20 cursor-pointer transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
      <Modal {...modal} onClose={() => setModal(p => ({ ...p, isOpen: false }))} />
    </div>
  );
};

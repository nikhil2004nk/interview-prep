import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotesApi, createNoteApi, updateNoteApi, deleteNoteApi } from '../api/notes';
import type { Note, Topic, Tag } from '../api/notes';
import { fetchTopicsApi, createTopicApi } from '../../topics/api/topics';
import { fetchTagsApi } from '../../tags/api/tags';
import { Search, Plus, Trash2, Save, FileText, Tag as TagIcon, LogOut, Loader2, HelpCircle, Target, BookOpen, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { Dropdown } from '../../../components/ui/Dropdown';
import { addToRevisionApi, RevisionItemType } from '../../revision/api/revision';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [topicId, setTopicId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const selectedNoteTagsStr = selectedNote ? selectedNote.tags.map(t => t.name).join(', ') : '';
  const hasChanges = selectedNote
    ? (title !== selectedNote.title || content !== selectedNote.content || tagsStr !== selectedNoteTagsStr || topicId !== (selectedNote.topic?.id || ''))
    : (title.trim().length > 0 || content.trim().length > 0 || tagsStr.trim().length > 0 || topicId.length > 0);

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
      if (notesData.length > 0 && !selectedNote) {
        selectNote(notesData[0]);
      }
    } catch (error) {
      console.error('Failed to load workspace data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagsStr(note.tags.map(t => t.name).join(', '));
    setTopicId(note.topic?.id || '');
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setTagsStr('');
    setTopicId('');
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    const tagNames = tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

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
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to save note', error);
      setSaveError(error.message || 'Failed to save note. Please verify backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNoteApi(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setTagsStr('');
      }
      const updatedTags = await fetchTagsApi();
      setTags(updatedTags);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic = !selectedTopicFilter || note.topic?.id === selectedTopicFilter;
    const matchesTag = !selectedTagFilter || note.tags.some(tag => tag.id === selectedTagFilter);

    return matchesSearch && matchesTopic && matchesTag;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-slate-900/40 border-r border-slate-800/80 flex flex-col h-auto md:h-screen">
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-sm">
              📚
            </div>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Notes Workspace
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              title="Dashboard"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <LayoutGrid size={16} />
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
              className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800/80 focus:border-purple-500/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
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
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex justify-between items-start ${
                  selectedNote?.id === note.id
                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800/40'
                }`}
              >
                <div className="space-y-1 flex-1 min-w-0 pr-2">
                  <h4 className="font-semibold text-sm truncate text-slate-200 group-hover:text-purple-400 transition-colors">
                    {note.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {note.content}
                  </p>
                  {(note.tags.length > 0 || note.topic) && (
                    <div className="flex flex-wrap gap-1 pt-1.5 items-center">
                      {note.topic && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/25">
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
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Floating actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
          <button
            onClick={handleNewNote}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-sm"
          >
            <Plus size={16} />
            Create Note
          </button>
        </div>
      </div>

      {/* Editor / Details view */}
      <div className="flex-1 flex flex-col h-screen bg-slate-950 relative">
        {selectedNote || isEditing ? (
          <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
            {/* Top Bar actions */}
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-4">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-purple-400" />
                <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
                  {selectedNote ? 'Note Workspace' : 'Drafting Note'}
                </span>
                {isEditing ? (
                  hasChanges ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1 animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-amber-400"></span> Unsaved changes
                    </span>
                  ) : (
                    selectedNote && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Saved
                      </span>
                    )
                  )
                ) : (
                  selectedNote && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Saved
                    </span>
                  )
                )}
              </div>
              <div className="flex items-center gap-2">
                 {!isEditing && selectedNote ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await addToRevisionApi(selectedNote.id, RevisionItemType.NOTE);
                          alert('Note added to revision deck!');
                        } catch (error: any) {
                          alert(error.message || 'Failed to add to revisions');
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-semibold rounded-lg text-xs transition-colors border border-purple-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen size={12} />
                      Queue Revision
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNote(null);
                        setTitle('');
                        setContent('');
                        setTagsStr('');
                        setTopicId('');
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-colors border border-slate-800/80 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer border border-slate-800/80"
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
                        setTagsStr('');
                        setTopicId('');
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-colors border border-slate-800/80 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges || !title.trim() || !content.trim()}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800/80 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs shadow-md disabled:shadow-none border border-transparent disabled:border transition-all flex items-center gap-1.5 cursor-pointer"
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
              <div className="bg-purple-950/15 border border-purple-500/15 rounded-xl p-4 text-xs text-purple-300 space-y-1">
                <p className="font-semibold text-purple-200">💡 Drafting a new note</p>
                <p className="text-purple-400">Provide a title, enter tags separated by commas, write your notes, and then click "Save Note" to save it.</p>
              </div>
            )}


            {/* Input Form Fields */}
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <input
                type="text"
                value={title}
                disabled={!isEditing}
                onChange={e => setTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full text-2xl md:text-3xl font-extrabold bg-transparent text-slate-100 placeholder:text-slate-800 focus:outline-none border-b border-transparent focus:border-slate-800/50 pb-2"
              />

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TagIcon size={12} />
                <input
                  type="text"
                  value={tagsStr}
                  disabled={!isEditing}
                  onChange={e => setTagsStr(e.target.value)}
                  placeholder="tags (comma separated, e.g. javascript, react)"
                  className="bg-transparent text-slate-300 placeholder:text-slate-700 focus:outline-none flex-1 py-1"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/35 border border-slate-900 rounded-lg p-2 max-w-sm w-full">
                <span className="font-semibold text-slate-400 uppercase tracking-wide shrink-0">Topic:</span>
                <Dropdown
                  value={topicId}
                  onChange={setTopicId}
                  disabled={!isEditing}
                  options={[
                    { value: '', label: 'Select Topic (Optional)' },
                    ...topics.map(t => ({ value: t.id, label: t.name })),
                  ]}
                  placeholder="Select Topic"
                  className="flex-1"
                />
                {isEditing && (
                  <button
                    onClick={async () => {
                      const name = window.prompt("Enter new Topic name:");
                      if (!name || !name.trim()) return;
                      try {
                        const created = await createTopicApi(name.trim());
                        setTopics(prev => [...prev, created]);
                        setTopicId(created.id);
                      } catch (error: any) {
                        alert(error.message || "Failed to create topic.");
                      }
                    }}
                    type="button"
                    className="p-1.5 hover:bg-slate-800 rounded text-purple-400 hover:text-purple-300 font-bold text-xs cursor-pointer transition-colors shrink-0"
                    title="Create New Topic"
                  >
                    + New
                  </button>
                )}
              </div>

              <textarea
                value={content}
                disabled={!isEditing}
                onChange={e => setContent(e.target.value)}
                placeholder="Write down your technical findings, snippets, concepts, or interview notes..."
                className="w-full flex-1 resize-none bg-transparent text-slate-300 placeholder:text-slate-800 focus:outline-none leading-relaxed text-sm md:text-base"
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-purple-400 hover:text-purple-300 font-semibold rounded-lg text-sm border border-purple-500/20 cursor-pointer transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

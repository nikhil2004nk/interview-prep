import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RevisionItemType,
  fetchDueRevisionsApi,
  submitReviewApi,
  deleteFromRevisionApi
} from '../api/revision';
import type { RevisionRecord } from '../api/revision';
import { ArrowLeft, BookOpen, Trash2, Eye } from 'lucide-react';

export const RevisionPage: React.FC = () => {
  const [records, setRecords] = useState<RevisionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RevisionRecord | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadDueRevisions = async () => {
    setLoading(true);
    try {
      const data = await fetchDueRevisionsApi();
      setRecords(data);
      if (data.length > 0) {
        setSelectedRecord(data[0]);
      } else {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('Failed to load due revisions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDueRevisions();
  }, []);

  const handleRating = async (rating: number) => {
    if (!selectedRecord) return;
    try {
      await submitReviewApi(selectedRecord.id, rating);
      
      // Animate transition to next card
      const remaining = records.filter(r => r.id !== selectedRecord.id);
      setRecords(remaining);
      setIsRevealed(false);
      
      if (remaining.length > 0) {
        setSelectedRecord(remaining[0]);
      } else {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('Failed to submit revision review', error);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this item from your spaced repetition schedule?')) return;
    try {
      await deleteFromRevisionApi(id);
      const remaining = records.filter(r => r.id !== id);
      setRecords(remaining);
      setIsRevealed(false);
      if (selectedRecord?.id === id) {
        if (remaining.length > 0) {
          setSelectedRecord(remaining[0]);
        } else {
          setSelectedRecord(null);
        }
      }
    } catch (error) {
      console.error('Failed to remove item from schedule', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-slate-900/40 border-r border-slate-800/80 flex flex-col h-auto md:h-screen">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Back to Workspace"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Revision Deck
            </span>
          </div>
          {records.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-black">
              {records.length} Due
            </span>
          )}
        </div>

        {/* Due Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              Loading revision deck...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-600 font-medium space-y-2">
              <p>🎉 All caught up!</p>
              <p className="text-[10px] px-4 leading-normal">
                No items are due for review today. Keep reading notes or practicing questions to schedule more reviews.
              </p>
            </div>
          ) : (
            records.map(r => (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRecord(r);
                  setIsRevealed(false);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col gap-1.5 ${
                  selectedRecord?.id === r.id
                    ? 'bg-purple-600/10 border-purple-500/50 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                    r.itemType === RevisionItemType.NOTE
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {r.itemType}
                  </span>
                  {r.item?.topic && (
                    <span className="text-[10px] text-slate-500 truncate max-w-28 font-medium">
                      {r.item.topic.name}
                    </span>
                  )}
                </div>
                <h4 className={`text-xs font-semibold truncate ${
                  selectedRecord?.id === r.id ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {r.item?.title || 'Untitled'}
                </h4>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Flashcard player */}
      <div className="flex-1 flex flex-col h-screen bg-slate-950 overflow-y-auto">
        {selectedRecord ? (
          <div className="flex-1 flex flex-col p-6 max-w-2xl w-full mx-auto justify-center space-y-6">
            {/* Flashcard Frame */}
            <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6 min-h-[350px] flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-60"></div>
              
              {/* Card Front details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-black uppercase ${
                      selectedRecord.itemType === RevisionItemType.NOTE
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/25'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                    }`}>
                      {selectedRecord.itemType} CARD
                    </span>
                    {selectedRecord.item?.difficulty && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-bold">
                        {selectedRecord.item.difficulty}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(selectedRecord.id)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove from spaced repetition deck"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedRecord.item?.topic && (
                    <span className="text-xs text-purple-400/90 font-semibold block uppercase tracking-wider">
                      Topic: {selectedRecord.item.topic.name}
                    </span>
                  )}
                  <h1 className="text-xl md:text-2xl font-black text-slate-100 leading-snug">
                    {selectedRecord.item?.title || 'Untitled'}
                  </h1>
                </div>

                {/* Back content container (Revealed) */}
                {isRevealed ? (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      {selectedRecord.itemType === RevisionItemType.NOTE ? 'Note content' : 'Question Prompt'}
                    </label>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto scrollbar-thin">
                      {selectedRecord.itemType === RevisionItemType.NOTE
                        ? selectedRecord.item?.content
                        : selectedRecord.item?.description}
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-900/10">
                    <button
                      onClick={() => setIsRevealed(true)}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-purple-400 hover:text-purple-300 font-bold text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer border border-slate-800"
                    >
                      <Eye size={14} />
                      Reveal Recall Content
                    </button>
                  </div>
                )}
              </div>

              {/* SM2 Spaced Repetition Quality ratings bar */}
              {isRevealed && (
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      How well did you recall this item?
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[
                      { rate: 0, label: 'Forgot', color: 'hover:bg-red-500/10 hover:border-red-500/30 text-red-400' },
                      { rate: 1, label: 'Hard', color: 'hover:bg-orange-500/10 hover:border-orange-500/30 text-orange-400' },
                      { rate: 2, label: 'Hesitant', color: 'hover:bg-amber-500/10 hover:border-amber-500/30 text-amber-400' },
                      { rate: 3, label: 'Alright', color: 'hover:bg-yellow-500/10 hover:border-yellow-500/30 text-yellow-400' },
                      { rate: 4, label: 'Good', color: 'hover:bg-green-500/10 hover:border-green-500/30 text-green-400' },
                      { rate: 5, label: 'Perfect', color: 'hover:bg-emerald-500/15 hover:border-emerald-500/40 text-emerald-350' },
                    ].map(r => (
                      <button
                        key={r.rate}
                        onClick={() => handleRating(r.rate)}
                        className={`py-2 rounded-lg border border-slate-850 bg-slate-950/40 text-[10px] font-black cursor-pointer transition-all flex flex-col items-center gap-1 ${r.color}`}
                      >
                        <span className="text-sm font-black">{r.rate}</span>
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
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
              <h3 className="font-bold text-slate-300">All Revisions Cleared</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Excellent! You have reviewed all scheduled items for today. Add more notes or practice tasks to review them again later.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

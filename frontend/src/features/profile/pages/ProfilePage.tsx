import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Mail, Calendar, Loader2 } from 'lucide-react';
import { getMeApi } from '../../auth/api/auth';
import type { User } from '../../auth/api/auth';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMeApi();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-200">
      <header className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-850 shrink-0 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-primary-400 transition-colors cursor-pointer block md:hidden"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center border border-primary-500/30">
            <UserIcon size={16} className="text-primary-400" />
          </div>
          <div>
            <h1 className="font-black text-slate-100 text-sm md:text-base leading-tight">My Profile</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              User Details
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
              {error}
            </div>
          ) : profile ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 filter blur-3xl rounded-full"></div>
              
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-100">{profile.name || 'Anonymous User'}</h2>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold mt-1">
                    Active Prepper
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col gap-1 p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} /> Email Address
                  </span>
                  <span className="text-sm text-slate-300 font-medium">{profile.email}</span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> Member Since
                  </span>
                  <span className="text-sm text-slate-300 font-medium">
                    {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon size={12} /> Account ID
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{profile.id}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

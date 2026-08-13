import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Palette, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/hooks/useTheme';
import type { Theme } from '../../theme/hooks/useTheme';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, mode, setMode } = useTheme();

  const themes: { id: Theme; name: string; primary: string; secondary: string; description: string }[] = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk (Default)',
      primary: 'bg-purple-500',
      secondary: 'bg-pink-500',
      description: 'The original bold Purple and Pink aesthetic.'
    },
    {
      id: 'ocean',
      name: 'Ocean Depth',
      primary: 'bg-blue-500',
      secondary: 'bg-cyan-500',
      description: 'Cool and calming Blues with a touch of Cyan.'
    },
    {
      id: 'forest',
      name: 'Emerald Forest',
      primary: 'bg-emerald-500',
      secondary: 'bg-amber-500',
      description: 'Fresh Greens paired with warm Amber highlights.'
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      primary: 'bg-orange-500',
      secondary: 'bg-rose-500',
      description: 'Vibrant Orange fading into deep Rose.'
    }
  ];

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
            <SettingsIcon size={16} className="text-primary-400" />
          </div>
          <div>
            <h1 className="font-black text-slate-100 text-sm md:text-base leading-tight">Settings</h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Preferences
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Palette size={16} className="text-primary-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Appearance & Theme</h2>
            </div>
            
            <p className="text-xs text-slate-400">
              Customize the look and feel of your PrepHQ workspace. Changes apply instantly across all devices.
            </p>

            <div className="flex items-center gap-4 py-2">
              <button
                onClick={() => setMode('dark')}
                className={`flex items-center justify-center gap-2 flex-1 p-3 rounded-xl border transition-all font-bold text-sm cursor-pointer ${
                  mode === 'dark'
                    ? 'bg-primary-600/10 border-primary-500/50 text-primary-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Moon size={16} /> Dark Mode
              </button>
              <button
                onClick={() => setMode('light')}
                className={`flex items-center justify-center gap-2 flex-1 p-3 rounded-xl border transition-all font-bold text-sm cursor-pointer ${
                  mode === 'light'
                    ? 'bg-primary-600/10 border-primary-500/50 text-primary-400'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Sun size={16} /> Light Mode
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-3
                    ${theme === t.id 
                      ? 'bg-slate-900 border-primary-500 shadow-[0_0_15px_rgba(var(--color-primary-500),0.1)]' 
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }
                  `}
                >
                  {theme === t.id && (
                    <div className="absolute top-3 right-3 text-primary-400">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <div className={`w-8 h-8 rounded-full ${t.primary} shadow-md`}></div>
                    <div className={`w-8 h-8 rounded-full ${t.secondary} -ml-4 shadow-md border-2 border-slate-900`}></div>
                  </div>
                  
                  <div>
                    <h3 className={`font-bold text-sm ${theme === t.id ? 'text-primary-400' : 'text-slate-200'}`}>
                      {t.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="pt-6 border-t border-slate-800/80 flex justify-end">
             <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-700"
              >
                Back to Dashboard
              </button>
          </div>

        </div>
      </main>
    </div>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'cyberpunk' | 'ocean' | 'forest' | 'sunset';
export type Mode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('prephq-theme');
    if (saved && ['cyberpunk', 'ocean', 'forest', 'sunset'].includes(saved)) {
      return saved as Theme;
    }
    return 'cyberpunk';
  });

  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('prephq-mode');
    if (saved && ['light', 'dark'].includes(saved)) {
      return saved as Mode;
    }
    return 'dark'; // Default is dark
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('prephq-theme', newTheme);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('prephq-mode', newMode);
  };

  useEffect(() => {
    // Remove old theme classes
    document.documentElement.classList.remove('theme-cyberpunk', 'theme-ocean', 'theme-forest', 'theme-sunset', 'light-mode');
    // Add new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    if (mode === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  }, [theme, mode]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

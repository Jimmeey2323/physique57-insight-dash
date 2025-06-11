
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type ThemeColor = 'purple' | 'blue' | 'emerald' | 'rose' | 'amber';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColor?: ThemeColor;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  themeColor: 'purple',
  setTheme: () => null,
  setThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  defaultColor = 'purple',
  storageKey = 'physique57-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    () => (localStorage.getItem(`${storageKey}-color`) as ThemeColor) || defaultColor
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.remove('theme-purple', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-amber');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    root.classList.add(`theme-${themeColor}`);
  }, [theme, themeColor]);

  const value = {
    theme,
    themeColor,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setThemeColor: (color: ThemeColor) => {
      localStorage.setItem(`${storageKey}-color`, color);
      setThemeColor(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

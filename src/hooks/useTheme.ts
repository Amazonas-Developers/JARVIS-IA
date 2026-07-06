import { useState } from 'react';
import type { Theme } from '@/types/ui';
import { saveTheme } from '@/libs/storage';

/*
  Modo claro/oscuro. El tema se materializa como la clase `dark` en <html>
  (ver @custom-variant en styles/index.css) y persiste en localStorage.
  El script inline de index.html aplica la clase guardada antes del primer
  render, así que aquí solo hay que leer el estado actual del DOM.
*/
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );

  const setTheme = (next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    saveTheme(next);
    setThemeState(next);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggleTheme };
}

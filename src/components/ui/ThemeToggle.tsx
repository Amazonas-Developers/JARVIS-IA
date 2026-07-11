import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

/** Botón de modo claro/oscuro; el tema persiste en localStorage. */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-panel-2 text-muted transition-all duration-200 hover:scale-105 hover:bg-panel-hover hover:text-accent"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
      )}
    </button>
  );
}

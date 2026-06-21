import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 flex items-center px-1"
      aria-label="Toggle theme"
    >
      {/* Toggle ball */}
      <div 
        className={`absolute w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-violet-400" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </div>
      
      {/* Background icons (for visual cue) */}
      <Sun className={`w-3.5 h-3.5 ml-0.5 transition-opacity ${isDark ? 'opacity-30' : 'opacity-0'} text-amber-500`} />
      <Moon className={`w-3.5 h-3.5 ml-auto mr-0.5 transition-opacity ${isDark ? 'opacity-0' : 'opacity-30'} text-violet-500`} />
    </button>
  );
}

export default ThemeToggle;
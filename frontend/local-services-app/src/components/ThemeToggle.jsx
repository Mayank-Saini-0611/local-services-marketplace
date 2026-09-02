import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ============================================================
   ThemeToggle
   ------------------------------------------------------------
   Three variants, all driven by the SINGLE ThemeContext:

     variant="switch"     (default) the original sliding switch
     variant="icon"       compact round icon button (auth pages)
     variant="segmented"  Light / Dark / System picker (Settings)

   The default export with NO props renders exactly the same
   switch as before, so DashboardLayout / AdminLayout keep working
   untouched.
   ============================================================ */

/* ---------- 1. SLIDING SWITCH (default, unchanged look) ---------- */
function SwitchToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 flex items-center px-1 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${className}`}
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

/* ---------- 2. ICON BUTTON (for pages with no navbar) ---------- */
function IconToggle({ className = '', showLabel = false }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-900/5 dark:shadow-black/40 transition-all hover:scale-[1.03] active:scale-95 hover:border-violet-400 dark:hover:border-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${className}`}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={`absolute w-4 h-4 text-amber-500 transition-all duration-300 ${
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <Moon
          className={`absolute w-4 h-4 text-violet-500 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </span>
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}

/* ---------- 3. SEGMENTED Light / Dark / System (Settings page) ---------- */
function SegmentedToggle({ className = '' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={`inline-flex p-1 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${className}`}
    >
      {options.map(({ id, label, icon: Icon }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(id)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
              active
                ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'system' && active && (
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                {resolvedTheme}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ThemeToggle({ variant = 'switch', className = '', showLabel = false }) {
  if (variant === 'icon') return <IconToggle className={className} showLabel={showLabel} />;
  if (variant === 'segmented') return <SegmentedToggle className={className} />;
  return <SwitchToggle className={className} />;
}

export default ThemeToggle;
export { SwitchToggle, IconToggle, SegmentedToggle };

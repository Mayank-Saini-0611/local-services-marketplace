import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

/* ============================================================
   THEME CONTEXT
   ------------------------------------------------------------
   Public API (100% backward compatible with the old version):

     const { isDark, toggleTheme } = useTheme();

   New (additive) API:

     const { theme, resolvedTheme, systemTheme, isDark,
             setTheme, toggleTheme, isSystem } = useTheme();

     theme          -> 'light' | 'dark' | 'system'   (what the user chose)
     resolvedTheme  -> 'light' | 'dark'              (what is on screen)
     systemTheme    -> 'light' | 'dark'              (OS preference, live)
     setTheme(t)    -> choose 'light' | 'dark' | 'system'
     toggleTheme()  -> flips light <-> dark (keeps old behaviour)
   ============================================================ */

const STORAGE_KEY = 'theme';
const THEMES = ['light', 'dark', 'system'];
const ANIM_CLASS = 'theme-anim';
const ANIM_DURATION = 320; // ms — must stay in sync with CSS transition time

/* ---------- tiny safe helpers (localStorage can throw in private mode) ---------- */

function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(value) ? value : 'system';
  } catch {
    // Safari private mode / blocked cookies / SSR
    return 'system';
  }
}

function writeStoredTheme(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore — theme still works for this session */
  }
}

function readSystemTheme() {
  try {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch {
    /* ignore */
  }
  return 'light';
}

/* ---------- the single place that actually paints the theme ---------- */

function applyTheme(resolved) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const isDark = resolved === 'dark';

  // 1. The `.dark` class — this is what Tailwind's `dark:` utilities AND
  //    the `html.dark ...` rules in index.css both listen to.
  root.classList.toggle('dark', isDark);

  // 2. A plain data attribute, handy for debugging / custom CSS.
  root.dataset.theme = resolved;

  // 3. Native UI (scrollbars, select popups, date pickers, autofill,
  //    spellcheck underlines) follows the theme too.
  root.style.colorScheme = resolved;

  // 4. Browser chrome colour on mobile (Android / iOS Safari).
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', isDark ? '#020617' : '#fafafa');
}

/* ---------- context ---------- */

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme); // user's choice
  const [systemTheme, setSystemTheme] = useState(readSystemTheme); // OS, live
  const animTimer = useRef(null);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';

  /* ---- 1. listen to the OS preference changing while the app is open ---- */
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    // NOTE: the initial value is already read by `useState(readSystemTheme)`
    // during the very first render, which happens AFTER the no-flash script
    // in index.html has run — so no extra sync is needed here, and calling
    // setState synchronously in an effect body would cause a cascading
    // re-render (and trips the react-hooks lint rule).
    const handleChange = (event) => setSystemTheme(event.matches ? 'dark' : 'light');

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    }
    // Legacy Safari (< 14)
    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, []);

  /* ---- 2. paint the DOM whenever the effective theme changes ---- */
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  /* ---- 3. persist the user's choice ---- */
  useEffect(() => {
    writeStoredTheme(theme);
  }, [theme]);

  /* ---- 4. sync across browser tabs / windows ---- */
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key && event.key !== STORAGE_KEY) return;
      setThemeState(readStoredTheme());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /* ---- 5. clean up the transition timer if unmounted mid-animation ---- */
  useEffect(() => () => {
    if (animTimer.current) window.clearTimeout(animTimer.current);
  }, []);

  /**
   * Smoothly cross-fade colours when the theme changes.
   * The `theme-anim` class is only on <html> for ~320ms, so we do NOT pay
   * the cost of a global `*` transition for the whole app lifetime.
   */
  const runThemeTransition = useCallback(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    window.clearTimeout(animTimer.current);
    root.classList.add(ANIM_CLASS);
    animTimer.current = window.setTimeout(() => {
      root.classList.remove(ANIM_CLASS);
    }, ANIM_DURATION);
  }, []);

  /** Choose 'light' | 'dark' | 'system'. */
  const setTheme = useCallback((next) => {
    runThemeTransition();
    setThemeState(THEMES.includes(next) ? next : 'system');
  }, [runThemeTransition]);

  /** Flip light <-> dark. Keeps the original 2-state behaviour intact. */
  const toggleTheme = useCallback(() => {
    runThemeTransition();
    setThemeState((prev) => {
      const current = prev === 'system' ? readSystemTheme() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, [runThemeTransition]);

  const value = useMemo(
    () => ({
      theme,            // 'light' | 'dark' | 'system'
      resolvedTheme,    // 'light' | 'dark'
      systemTheme,      // 'light' | 'dark'
      isDark,           // boolean
      isSystem: theme === 'system',
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, systemTheme, isDark, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export default ThemeContext;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

/* ============================================================
   FloatingThemeToggle
   ------------------------------------------------------------
   Gives the PUBLIC pages (Login, Register, Forgot / Reset
   Password, Verify Email, 404) a theme switch, because those
   pages have no navbar and therefore no toggle at all.

   It hides itself automatically on /dashboard/* and /admin/*
   because DashboardLayout and AdminLayout already ship their own
   switch in the header — we never show two at once.

   Also adds a keyboard shortcut:
        Ctrl / Cmd + Shift + L   ->  flip light <-> dark
   (ignored while you are typing in an input, textarea,
    select or contenteditable element)
   ============================================================ */

export default function FloatingThemeToggle() {
  const { pathname } = useLocation();
  const { toggleTheme } = useTheme();

  const hasOwnToggle = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey) return;
      if (event.key !== 'L' && event.key !== 'l') return;

      // never steal the shortcut while the user is typing
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      toggleTheme();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleTheme]);

  if (hasOwnToggle) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] print:hidden">
      <ThemeToggle variant="icon" />
    </div>
  );
}

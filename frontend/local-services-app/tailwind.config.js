/** @type {import('tailwindcss').Config} */
export default {
  // ============================================================
  //  CRITICAL: tells Tailwind to switch dark mode using the
  //  `class` strategy (i.e. look for `.dark` on <html>).
  //
  //  WITHOUT this line Tailwind falls back to the default
  //  `media` strategy, which compiles every `dark:` utility into
  //  `@media (prefers-color-scheme: dark)` — the OPERATING SYSTEM
  //  setting. That is why only the parts styled by the hand-written
  //  `html.dark ...` rules in index.css reacted to the toggle and
  //  the rest of the screen stayed dark.
  // ============================================================
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

# Theme System (Light / Dark / System)

Everything about theming lives in **5 files**. If dark mode ever breaks again,
check them in this order.

---

## The bug that was fixed (read this first)

**Symptom:** clicking the theme toggle only changed *some* blocks on the page
(cards, body, inputs). Everything else stayed dark.

**Cause:** `darkMode` was **missing** from `tailwind.config.js`.

Tailwind's default `darkMode` strategy is `'media'`, which compiles every
`dark:` utility into:

```css
@media (prefers-color-scheme: dark) { .dark\:bg-slate-900 { … } }
```

That is the **operating system** setting — it completely ignores the `.dark`
class that `ThemeContext` puts on `<html>`. So the only things that reacted to
the toggle were the hand-written `html.dark …` rules in `src/index.css`.
That mismatch was exactly the "half the screen changed" effect.

**Fix — one line in `tailwind.config.js`:**

```js
export default {
  darkMode: 'class',   // <-- THIS
  content: [ … ],
  …
}
```

With `'class'`, Tailwind compiles to `:is(.dark) .dark\:bg-slate-900 { … }`,
which follows the toggle.

### How to verify the fix yourself

```bash
npm run build
grep -c "prefers-color-scheme" dist/assets/*.css   # must print 0
grep -o "\.dark " dist/assets/*.css | wc -l        # should be > 100
```

---

## The 5 files

| # | File | What it does |
|---|------|--------------|
| 1 | `tailwind.config.js` | `darkMode: 'class'` — makes every `dark:` utility follow the toggle |
| 2 | `index.html` | Inline no-flash script that paints the correct theme **before** first paint |
| 3 | `src/context/ThemeContext.jsx` | Single source of truth: reads/writes `localStorage`, watches OS, updates the DOM |
| 4 | `src/index.css` | `color-scheme`, the switch cross-fade, and dark overrides (gradients, Leaflet, extras) |
| 5 | `src/components/ThemeToggle.jsx` | The 3 switch variants. `FloatingThemeToggle.jsx` puts one on public pages |

### How the state flows

```
user clicks switch
      │
      ▼
ThemeToggle  ──toggleTheme() / setTheme()──►  ThemeContext
                                                    │
                    ┌───────────────────────────────┼───────────────────────┐
                    ▼                               ▼                       ▼
        localStorage['theme']            <html class="dark">        meta[name=theme-color]
        'light' | 'dark' | 'system'      + data-theme + color-scheme
                                                    │
                        ┌───────────────────────────┴────────────────────┐
                        ▼                                                ▼
              Tailwind `dark:` utilities                    `html.dark …` rules in index.css
```

---

## Using the theme in your components

```jsx
import { useTheme } from '../context/ThemeContext';

const { theme, resolvedTheme, systemTheme, isDark, isSystem, setTheme, toggleTheme } = useTheme();
```

| Value | Type | Meaning |
|---|---|---|
| `theme` | `'light' \| 'dark' \| 'system'` | what the **user picked** |
| `resolvedTheme` | `'light' \| 'dark'` | what is **actually on screen** |
| `systemTheme` | `'light' \| 'dark'` | live OS preference |
| `isDark` | `boolean` | shorthand for `resolvedTheme === 'dark'` |
| `isSystem` | `boolean` | user is following the OS |
| `setTheme(t)` | `fn` | pick `'light'`, `'dark'` or `'system'` |
| `toggleTheme()` | `fn` | flip light ⇄ dark (old 2-state behaviour — still works) |

### The 3 toggle variants

```jsx
<ThemeToggle />                          {/* sliding switch — default, unchanged look */}
<ThemeToggle variant="icon" />           {/* round icon button (public pages) */}
<ThemeToggle variant="segmented" />      {/* Light | Dark | System (Settings page) */}
```

### Writing dark-mode-safe markup

Always give **both** states:

```jsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800">
```

> Tip: `src/index.css` also contains `html.dark .bg-white { … !important }`
> fallback rules. They are a safety net for older components that only have
> light classes — they do **not** replace the need for `dark:` utilities.

---

## Extras added

- **No flash on load** — `index.html` paints the theme before React mounts.
- **Live OS sync** — change your OS theme, the app follows (only in `system` mode).
- **Cross-tab sync** — toggling in one tab updates all open tabs instantly.
- **Smooth cross-fade** — `theme-anim` is added to `<html>` for 320 ms only.
- **`color-scheme`** — native scrollbars, `<select>` popups, date pickers and
  autofill all match the theme.
- **Mobile browser chrome** — `<meta name="theme-color">` updated live.
- **Keyboard shortcut** — `Ctrl`/`Cmd` + `Shift` + `L` (ignored while typing).
- **Reduced motion** — cross-fade is disabled for users who ask for it.
- **Dark Leaflet map** — tile filter + dark popups/controls in `ServiceMap`.
- **Dark gradient stops** — `from-slate-50 / via-blue-50 / to-violet-100` etc.
- **Toggle on public pages** — Login, Register, Forgot / Reset Password,
  Verify Email and the 404 page (auto-hides on `/dashboard` and `/admin`).

## Gotchas

- If you rename the `localStorage` key, change it in **both**
  `src/context/ThemeContext.jsx` (`STORAGE_KEY`) **and** the inline script in
  `index.html`. They are not linked by an import.
- Don't remove the inline script — React would mount in the wrong theme and you
  would see a flash.
- `npm run build` is the fastest way to confirm `darkMode` is still `'class'`.

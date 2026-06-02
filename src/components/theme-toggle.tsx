'use client';

import { useState, useEffect, useCallback } from 'react';

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem('tdapp-theme', dark ? 'dark' : 'light');
  } catch {
    // localStorage not available
  }
}

const SunIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

export default function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark]       = useState(false);

  // Run only on the client, after hydration — reads the real DOM state
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  }, []);

  // Server + initial client render: neutral button with no icon so both sides match exactly.
  // After mount the correct icon appears — no hydration mismatch possible.
  return (
    <button
      onClick={toggle}
      aria-label={mounted ? (dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro') : 'Cambiar tema'}
      className={className}
    >
      {mounted && (dark ? <SunIcon /> : <MoonIcon />)}
    </button>
  );
}

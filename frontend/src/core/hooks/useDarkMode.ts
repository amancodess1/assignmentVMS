import { useState, useEffect } from 'react';

// Initialize dark mode immediately (before React renders)
function initializeDarkMode() {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) {
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }
}

// Run immediately
if (typeof window !== 'undefined') {
  initializeDarkMode();
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update document class and localStorage
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      console.log('Dark mode enabled - class added to html');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      console.log('Dark mode disabled - class removed from html');
    }
    console.log('HTML classes:', html.className);
  }, [isDark]);

  const toggle = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggle };
}


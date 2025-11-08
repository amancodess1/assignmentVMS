import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    // Reset localStorage and DOM
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);
  });

  it('should initialize with light mode by default', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should load dark mode from localStorage', () => {
    localStorage.setItem('darkMode', 'true');
    
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDark).toBe(false);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('darkMode')).toBe('true');
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('should use system preference when localStorage is empty', () => {
    localStorage.removeItem('darkMode');
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true, // System prefers dark
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);
    
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current.isDark).toBe(true);
  });
});


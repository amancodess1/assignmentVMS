import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import RoutesTab from './adapters/ui/RoutesTab'
import CompareTab from './adapters/ui/CompareTab'
import BankingTab from './adapters/ui/BankingTab'
import PoolingTab from './adapters/ui/PoolingTab'
import { useDarkMode } from './core/hooks/useDarkMode'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()
  const isActive = location.pathname === to || (to === '/' && location.pathname === '/')
  
  return (
    <Link
      to={to}
      className={`
        px-6 py-3 rounded-lg font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
        }
      `}
    >
      {children}
    </Link>
  )
}

function DarkModeToggle() {
  const { isDark, toggle } = useDarkMode()

  const handleToggle = () => {
    console.log('Toggling dark mode, current:', isDark);
    toggle();
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        // Sun icon - click to switch to light mode
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon - click to switch to dark mode
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              FuelEU Compliance Dashboard
            </h1>
            <DarkModeToggle />
          </div>
          <nav className="flex gap-3">
            <NavLink to="/">Routes</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/banking">Banking</NavLink>
            <NavLink to="/pooling">Pooling</NavLink>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<RoutesTab />} />
          <Route path="/compare" element={<CompareTab />} />
          <Route path="/banking" element={<BankingTab />} />
          <Route path="/pooling" element={<PoolingTab />} />
        </Routes>
      </div>
    </div>
  )
}

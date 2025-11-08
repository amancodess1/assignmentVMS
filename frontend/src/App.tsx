import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import RoutesTab from './adapters/ui/RoutesTab'
import CompareTab from './adapters/ui/CompareTab'
import BankingTab from './adapters/ui/BankingTab'
import PoolingTab from './adapters/ui/PoolingTab'

export default function App() {
  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">FuelEU Compliance Dashboard</h1>
      <nav className="flex gap-4 mb-4">
        <Link to="/">Routes</Link>
        <Link to="/compare">Compare</Link>
        <Link to="/banking">Banking</Link>
        <Link to="/pooling">Pooling</Link>
      </nav>
      <Routes>
        <Route path="/" element={<RoutesTab />} />
        <Route path="/compare" element={<CompareTab />} />
        <Route path="/banking" element={<BankingTab />} />
        <Route path="/pooling" element={<PoolingTab />} />
      </Routes>
    </div>
  )
}

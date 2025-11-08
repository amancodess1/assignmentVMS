import React, { useEffect, useState } from 'react';

export default function BankingTab() {
  const [cb, setCb] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [banking, setBanking] = useState(false);
  const [applying, setApplying] = useState(false);
  const [shipId, setShipId] = useState('SHIP001');
  const [year, setYear] = useState(2024);
  const [amount, setAmount] = useState('');
  const [applyAmount, setApplyAmount] = useState('');
  const [bankResult, setBankResult] = useState<any>(null);
  const [applyResult, setApplyResult] = useState<any>(null);
  const [bankRecords, setBankRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    fetchCB();
    fetchBankRecords();
  }, [year, shipId]);

  const fetchCB = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/compliance/cb?year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch CB data');
      const data = await response.json();
      setCb(data.cb_before || data.cb);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await fetch(`/api/banking/records?shipId=${shipId}&year=${year}`);
      if (!response.ok) throw new Error('Failed to fetch banking records');
      const data = await response.json();
      setBankRecords(data);
    } catch (err: any) {
      console.error('Failed to fetch records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleBankSurplus = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (cb !== null && cb <= 0) {
      alert('Cannot bank: Compliance balance must be positive');
      return;
    }

    setBanking(true);
    setError(null);
    try {
      const response = await fetch('/api/banking/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipId,
          year,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bank surplus');
      }

      const result = await response.json();
      setBankResult(result);
      setAmount('');
      fetchCB(); // Refresh CB
      fetchBankRecords(); // Refresh records
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBanking(false);
    }
  };

  const handleApplyBanked = async () => {
    if (!applyAmount || parseFloat(applyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setApplying(true);
    setError(null);
    try {
      const response = await fetch('/api/banking/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipId,
          year,
          amount: parseFloat(applyAmount),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply banked surplus');
      }

      const result = await response.json();
      setApplyResult(result);
      setApplyAmount('');
      fetchCB(); // Refresh CB
      fetchBankRecords(); // Refresh records
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const totalBanked = bankRecords
    .filter(r => r.amount_gco2eq > 0)
    .reduce((sum, r) => sum + r.amount_gco2eq, 0);
  const totalApplied = Math.abs(bankRecords
    .filter(r => r.amount_gco2eq < 0)
    .reduce((sum, r) => sum + r.amount_gco2eq, 0));
  const availableBanked = totalBanked - totalApplied;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Compliance Balance</h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full"
                min="2020"
                max="2030"
              />
            </div>
            <button
              onClick={fetchCB}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center py-8">
              <div className="loading-spinner"></div>
              <span className="ml-3 text-gray-600">Loading compliance balance...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Compliance Balance (gCO₂eq)</div>
              <div className="text-4xl font-bold text-blue-700">
                {cb !== null ? cb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
              </div>
              {cb !== null && (
                <div className="mt-2 text-xs text-gray-500">
                  {cb > 0 ? '✓ Positive balance - can bank surplus' : '✗ Zero or negative - cannot bank'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Banking Operations</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ship ID</label>
            <input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className="w-full"
              placeholder="Enter ship ID"
            />
          </div>
          
          {/* Bank Surplus Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Bank Surplus</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Bank (gCO₂eq)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
            <button
              onClick={handleBankSurplus}
              disabled={banking || !amount || (cb !== null && cb <= 0)}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {banking ? 'Banking...' : 'Bank Surplus'}
            </button>

            {bankResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <div className="text-sm font-medium text-green-800 mb-2">Banking Successful</div>
                <div className="text-sm text-green-700">
                  <div>Applied: {bankResult.applied?.toFixed(2) || 'N/A'} gCO₂eq</div>
                  <div>Remaining: {bankResult.remaining?.toFixed(2) || 'N/A'} gCO₂eq</div>
                </div>
              </div>
            )}
          </div>

          {/* Apply Banked Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Apply Banked Surplus</h3>
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-700">
                <div>Available Banked: <strong>{availableBanked.toFixed(2)}</strong> gCO₂eq</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Apply (gCO₂eq)</label>
              <input
                type="number"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                className="w-full"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                max={availableBanked}
              />
            </div>
            <button
              onClick={handleApplyBanked}
              disabled={applying || !applyAmount || availableBanked <= 0}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 mt-4"
            >
              {applying ? 'Applying...' : 'Apply Banked Surplus'}
            </button>

            {applyResult && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                <div className="text-sm font-medium text-purple-800 mb-2">Application Successful</div>
                <div className="text-sm text-purple-700">
                  <div>Applied: {applyResult.applied?.toFixed(2) || 'N/A'} gCO₂eq</div>
                  <div>Remaining: {applyResult.remaining?.toFixed(2) || 'N/A'} gCO₂eq</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banking Records */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Banking Records</h2>
        {loadingRecords ? (
          <div className="flex items-center py-8">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-gray-600">Loading records...</span>
          </div>
        ) : bankRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No banking records found</div>
        ) : (
          <div className="table-container overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Record ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Amount (gCO₂eq)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bankRecords.map((record: any) => (
                  <tr key={record.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ID: {record.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.amount_gco2eq > 0 ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Banked
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          Applied
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      record.amount_gco2eq > 0 ? 'text-green-700' : 'text-purple-700'
                    }`}>
                      {record.amount_gco2eq > 0 ? '+' : ''}{record.amount_gco2eq.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

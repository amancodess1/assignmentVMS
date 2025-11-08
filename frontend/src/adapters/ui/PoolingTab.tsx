import React, { useState } from 'react';

export default function PoolingTab() {
  const [poolId, setPoolId] = useState('');
  const [year, setYear] = useState(2024);
  const [members, setMembers] = useState([{ shipId: '', cb: '' }]);
  const [adjustedCB, setAdjustedCB] = useState<number | null>(null);
  const [poolResult, setPoolResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addMember = () => {
    setMembers([...members, { shipId: '', cb: '' }]);
  };

  const updateMember = (index: number, field: 'shipId' | 'cb', value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // Calculate pool sum and validation
  const validMembers = members
    .filter(m => m.shipId && m.cb && !isNaN(parseFloat(m.cb)))
    .map(m => ({ shipId: m.shipId, cb: parseFloat(m.cb) }));

  const poolSum = validMembers.reduce((sum, m) => sum + m.cb, 0);
  const isValidPool = poolSum >= 0 && validMembers.length >= 2;

  // Validation messages
  const validationErrors: string[] = [];
  if (validMembers.length < 2) {
    validationErrors.push('At least 2 members required');
  }
  if (poolSum < 0) {
    validationErrors.push('Pool sum must be ≥ 0 (currently ' + poolSum.toFixed(2) + ')');
  }

  const handleCreatePool = async () => {
    if (!isValidPool) {
      alert('Pool validation failed: ' + validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/pools/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          members: validMembers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create pool');
      }

      const result = await response.json();
      setPoolResult(result);
      setPoolId(result.poolId.toString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustedCB = async () => {
    if (!poolId) {
      alert('Please enter a pool ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pools/adjusted-cb?poolId=${poolId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch adjusted CB');
      }
      const data = await response.json();
      setAdjustedCB(data.adjustedCB);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create Pool</h2>
        <div className="space-y-4">
          <div>
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

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Pool Members</label>
              <button
                onClick={addMember}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                + Add Member
              </button>
            </div>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={member.shipId}
                    onChange={(e) => updateMember(index, 'shipId', e.target.value)}
                    className="flex-1"
                    placeholder="Ship ID"
                  />
                  <input
                    type="number"
                    value={member.cb}
                    onChange={(e) => updateMember(index, 'cb', e.target.value)}
                    className="flex-1"
                    placeholder="CB (gCO₂eq)"
                    step="0.01"
                  />
                  {members.length > 1 && (
                    <button
                      onClick={() => removeMember(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pool Sum Indicator */}
          <div className={`p-4 rounded-lg border-2 ${
            poolSum >= 0 && validMembers.length >= 2
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Pool Sum</div>
                <div className={`text-2xl font-bold ${
                  poolSum >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {poolSum.toFixed(2)} gCO₂eq
                </div>
              </div>
              <div className="text-4xl">
                {poolSum >= 0 && validMembers.length >= 2 ? '✓' : '✗'}
              </div>
            </div>
            {validationErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-700">
                {validationErrors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}
            {isValidPool && (
              <div className="mt-2 text-sm text-green-700">
                ✓ Pool is valid - Sum ≥ 0 and rules will be enforced
              </div>
            )}
          </div>

          {/* Validation Rules Info */}
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
            <div className="font-medium mb-1">Pooling Rules:</div>
            <div>• Sum of all CBs must be ≥ 0</div>
            <div>• Deficit ships cannot exit worse</div>
            <div>• Surplus ships cannot exit negative</div>
          </div>

          <button
            onClick={handleCreatePool}
            disabled={loading || !isValidPool}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Pool...' : 'Create Pool'}
          </button>

          {poolResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800 mb-2">Pool Created Successfully</div>
              <div className="text-sm text-green-700">
                <div>Pool ID: {poolResult.poolId}</div>
                <div className="mt-2">
                  <div className="font-medium mb-1">Allocations (Before → After):</div>
                  <div className="space-y-1">
                    {poolResult.allocations?.map((alloc: any, idx: number) => {
                      const improved = alloc.cb_after > alloc.cb_before;
                      const worsened = alloc.cb_after < alloc.cb_before;
                      const wasDeficit = alloc.cb_before < 0;
                      const wasSurplus = alloc.cb_before > 0;
                      const isNowNegative = alloc.cb_after < 0;
                      
                      // Check rules
                      const ruleViolation = (wasDeficit && worsened) || (wasSurplus && isNowNegative);
                      
                      return (
                        <div key={idx} className={`text-xs p-2 rounded ${
                          ruleViolation ? 'bg-red-100' : 'bg-white'
                        }`}>
                          <div className="font-medium">{alloc.shipId}:</div>
                          <div>
                            {alloc.cb_before.toFixed(2)} → {alloc.cb_after.toFixed(2)} gCO₂eq
                            {improved && <span className="text-green-600 ml-1">↑</span>}
                            {worsened && <span className="text-red-600 ml-1">↓</span>}
                          </div>
                          {ruleViolation && (
                            <div className="text-red-600 mt-1">⚠ Rule violation</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Fetch Adjusted CB</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pool ID</label>
            <input
              type="number"
              value={poolId}
              onChange={(e) => setPoolId(e.target.value)}
              className="w-full"
              placeholder="Enter pool ID"
            />
          </div>
          <button
            onClick={fetchAdjustedCB}
            disabled={loading || !poolId}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Fetch Adjusted CB'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {adjustedCB !== null && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Adjusted Compliance Balance (gCO₂eq)</div>
              <div className="text-4xl font-bold text-purple-700">
                {adjustedCB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

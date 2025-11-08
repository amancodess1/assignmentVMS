import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CompareTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/routes/comparison')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch comparison data');
        return r.json();
      })
      .then((result) => {
        // Map backend data to frontend format
        const mapped = result.map((row: any) => ({
          routeId: row.routeId,
          baseline: row.baseline ? {
            ghgIntensity: row.baseline.ghg_intensity,
            routeId: row.baseline.route_id,
          } : null,
          comparison: row.comparison ? {
            ghgIntensity: row.comparison.ghg_intensity,
            routeId: row.comparison.route_id,
          } : null,
          percentDiff: row.percentDiff,
          compliant: row.compliant,
        }));
        setData(mapped);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Route Comparison</h2>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading comparison data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No comparison data available.</p>
          <p className="text-sm text-gray-400">Please set a baseline route first.</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="mb-8 card">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">GHG Intensity Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.map((row: any) => ({
                routeId: row.routeId,
                baseline: row.baseline?.ghgIntensity || 0,
                comparison: row.comparison?.ghgIntensity || 0,
                target: 89.3368,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="routeId" />
                <YAxis label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#3b82f6" name="Baseline" />
                <Bar dataKey="comparison" fill="#10b981" name="Comparison" />
                <Bar dataKey="target" fill="#ef4444" name="Target (89.34)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="table-container overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Route ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Baseline GHG</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Comparison GHG</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">% Difference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row: any) => (
                <tr key={row.routeId} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.routeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {row.baseline?.ghgIntensity ? row.baseline.ghgIntensity.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {row.comparison?.ghgIntensity ? row.comparison.ghgIntensity.toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${
                      row.percentDiff > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {row.percentDiff > 0 ? '+' : ''}{row.percentDiff.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.compliant ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Compliant
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        ✗ Non-Compliant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

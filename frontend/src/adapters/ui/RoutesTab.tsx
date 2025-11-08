import React, { useEffect, useState } from 'react';
import { RouteRow } from '../../core/domain/types';

export default function RoutesTab() {
  const [allRoutes, setAllRoutes] = useState<RouteRow[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  
  // Filters
  const [vesselTypeFilter, setVesselTypeFilter] = useState<string>('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  useEffect(() => {
    fetch('/api/routes')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch routes');
        return r.json();
      })
      .then((data) => {
        // Map backend data to frontend format
        const mapped = data.map((r: any) => ({
          id: r.id,
          routeId: r.route_id,
          vesselType: r.vessel_type,
          fuelType: r.fuel_type,
          year: r.year,
          ghgIntensity: r.ghg_intensity,
          fuelConsumption: r.fuel_consumption,
          distance: r.distance_km,
          totalEmissions: r.total_emissions,
          isBaseline: r.is_baseline,
        }));
        setAllRoutes(mapped);
        setFilteredRoutes(mapped);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = [...allRoutes];
    
    if (vesselTypeFilter) {
      filtered = filtered.filter(r => r.vesselType === vesselTypeFilter);
    }
    if (fuelTypeFilter) {
      filtered = filtered.filter(r => r.fuelType === fuelTypeFilter);
    }
    if (yearFilter) {
      filtered = filtered.filter(r => r.year === Number(yearFilter));
    }
    
    setFilteredRoutes(filtered);
  }, [vesselTypeFilter, fuelTypeFilter, yearFilter, allRoutes]);

  const handleSetBaseline = async (id: number) => {
    setUpdating(id);
    try {
      const response = await fetch(`/api/routes/${id}/baseline`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to set baseline');
      // Refresh routes
      const data = await fetch('/api/routes').then(r => r.json());
      const mapped = data.map((r: any) => ({
        id: r.id,
        routeId: r.route_id,
        vesselType: r.vessel_type,
        fuelType: r.fuel_type,
        year: r.year,
        ghgIntensity: r.ghg_intensity,
        fuelConsumption: r.fuel_consumption,
        distance: r.distance_km,
        totalEmissions: r.total_emissions,
        isBaseline: r.is_baseline,
      }));
      setAllRoutes(mapped);
    } catch (err: any) {
      alert(err.message || 'Failed to set baseline');
    } finally {
      setUpdating(null);
    }
  };

  // Get unique values for filters
  const vesselTypes = [...new Set(allRoutes.map(r => r.vesselType))].sort();
  const fuelTypes = [...new Set(allRoutes.map(r => r.fuelType))].sort();
  const years = [...new Set(allRoutes.map(r => r.year))].sort((a, b) => b - a);

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Routes</h2>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vessel Type</label>
          <select
            value={vesselTypeFilter}
            onChange={(e) => setVesselTypeFilter(e.target.value)}
            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Types</option>
            {vesselTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fuel Type</label>
          <select
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Fuels</option>
            {fuelTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setVesselTypeFilter('');
              setFuelTypeFilter('');
              setYearFilter('');
            }}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 font-medium transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading routes...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No routes found {vesselTypeFilter || fuelTypeFilter || yearFilter ? 'matching filters' : ''}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRoutes.length} of {allRoutes.length} routes
          </div>
          <div className="table-container overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Route ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Vessel Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Fuel Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Year</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">GHG Intensity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Fuel Consumption</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Distance (km)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Total Emissions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRoutes.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.routeId}</span>
                      {r.isBaseline && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Baseline</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{r.vesselType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{r.fuelType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{r.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{r.ghgIntensity.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{r.fuelConsumption.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{r.distance.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{r.totalEmissions.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === r.id ? null : r.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        Actions
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {openDropdown === r.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenDropdown(null)}
                          ></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleSetBaseline(r.id);
                                  setOpenDropdown(null);
                                }}
                                disabled={updating === r.id || r.isBaseline}
                                className={`w-full text-left px-4 py-2 text-sm ${
                                  updating === r.id || r.isBaseline
                                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                                } transition-colors`}
                              >
                                {updating === r.id ? 'Setting...' : r.isBaseline ? '✓ Already Baseline' : 'Set as Baseline'}
                              </button>
                              <button
                                onClick={() => {
                                  alert(`Route Details:\nID: ${r.routeId}\nVessel: ${r.vesselType}\nFuel: ${r.fuelType}\nYear: ${r.year}\nGHG Intensity: ${r.ghgIntensity.toFixed(2)} gCO₂e/MJ`);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                View Details
                              </button>
                              {r.isBaseline && (
                                <div className="px-4 py-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
                                  ✓ This is the baseline route
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
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

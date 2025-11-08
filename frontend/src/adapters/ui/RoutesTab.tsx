import React, { useEffect, useState } from 'react'
import { RouteRow } from '../../core/domain/types'

export default function RoutesTab(){
  const [routes, setRoutes] = useState<RouteRow[]>([])

  useEffect(()=>{
    fetch('/api/routes').then(r=>r.json()).then(setRoutes).catch(()=>{})
  },[])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Routes</h2>
      <table className="min-w-full bg-white">
        <thead><tr>
          <th>routeId</th><th>vesselType</th><th>fuelType</th><th>year</th><th>ghgIntensity</th><th>fuelConsumption</th><th>distance</th><th>totalEmissions</th><th></th>
        </tr></thead>
        <tbody>
          {routes.map(r=> (
            <tr key={r.routeId} className="border-t">
              <td>{r.routeId}</td>
              <td>{r.vesselType}</td>
              <td>{r.fuelType}</td>
              <td>{r.year}</td>
              <td>{r.ghgIntensity}</td>
              <td>{r.fuelConsumption}</td>
              <td>{r.distance}</td>
              <td>{r.totalEmissions}</td>
              <td>
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>{
                  fetch(`/api/routes/${r.id}/baseline`,{method:'POST'}).then(()=>alert('baseline set')).catch(()=>{})
                }}>Set Baseline</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import React, { useEffect, useState } from 'react'

export default function CompareTab(){
  const [data, setData] = useState<any[]>([])

  useEffect(()=>{
    fetch('/api/routes/comparison').then(r=>r.json()).then(setData).catch(()=>{})
  },[])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Compare</h2>
      <table className="min-w-full bg-white">
        <thead><tr>
          <th>routeId</th><th>baseline ghg</th><th>comparison ghg</th><th>% diff</th><th>compliant</th>
        </tr></thead>
        <tbody>
          {data.map((row:any)=>(
            <tr key={row.routeId} className="border-t">
              <td>{row.routeId}</td>
              <td>{row.baseline?.ghgIntensity ?? '-'}</td>
              <td>{row.comparison?.ghgIntensity ?? '-'}</td>
              <td>{(row.percentDiff||0).toFixed(2)}%</td>
              <td>{row.compliant? '✅':'❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

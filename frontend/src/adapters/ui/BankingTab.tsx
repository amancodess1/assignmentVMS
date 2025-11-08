import React, { useEffect, useState } from 'react'

export default function BankingTab(){
  const [cb, setCb] = useState<number | null>(null)

  useEffect(()=>{
    fetch('/api/compliance/cb?year=2024').then(r=>r.json()).then((d:any)=>setCb(d.cb_before)).catch(()=>{})
  },[])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Banking</h2>
      <div>CB Before: {cb ?? '-'}</div>
      <div className="mt-2">
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={()=>alert('banking not implemented in frontend')}>Bank Surplus</button>
      </div>
    </div>
  )
}

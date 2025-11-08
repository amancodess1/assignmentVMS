export function createPool(members:{shipId:string, cb:number}[]){
  // greedy: sort desc by cb, transfer to deficits
  const result = members.map(m=>({shipId:m.shipId, cb_before: m.cb, cb_after: m.cb}))
  let surplus = result.filter(r=>r.cb_after>0).sort((a,b)=>b.cb_after - a.cb_after)
  let deficit = result.filter(r=>r.cb_after<0).sort((a,b)=>a.cb_after - b.cb_after)

  for(const s of surplus){
    for(const d of deficit){
      if(s.cb_after<=0) break
      const need = -d.cb_after
      const give = Math.min(s.cb_after, need)
      s.cb_after -= give
      d.cb_after += give
    }
  }
  return result
}

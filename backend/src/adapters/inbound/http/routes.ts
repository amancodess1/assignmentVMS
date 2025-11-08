import { Router } from 'express'
const router = Router()

// lightweight in-memory mock logic for dev seed
let store = [] as any[]

router.get('/', (req,res)=>{
  res.json(store)
})

router.post('/:id/baseline', (req,res)=>{
  const id = Number(req.params.id)
  store = store.map(s=> ({...s, is_baseline: s.id===id}))
  res.json({ok:true})
})

router.get('/comparison', (req,res)=>{
  // naive comparison: return pairs
  const baseline = store.find(s=>s.is_baseline)
  const others = store.filter(s=>!s.is_baseline)
  const result = others.map(o=>({
    routeId: o.route_id,
    baseline: baseline,
    comparison: o,
    percentDiff: baseline ? ((o.ghg_intensity / baseline.ghg_intensity) -1)*100 : null,
    compliant: o.ghg_intensity <= 89.3368
  }))
  res.json(result)
})

export default router

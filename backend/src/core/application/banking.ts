export function bankSurplus(available:number, amount:number){
  if(amount<0) throw new Error('amount must be positive')
  if(amount>available) throw new Error('insufficient available')
  return { applied: amount, remaining: available - amount }
}

export function applyBanked(available:number, toApply:number){
  if(toApply<0) throw new Error('toApply must be positive')
  const applied = Math.min(available, toApply)
  return { applied, remaining: available - applied }
}

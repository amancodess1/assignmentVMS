export function computePercentDiff(baseline:number, comparison:number){
  return ((comparison / baseline) - 1) * 100
}

export function isCompliant(ghg:number){
  return ghg <= 89.3368
}

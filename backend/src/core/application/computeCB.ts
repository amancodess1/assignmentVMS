const TARGET = 89.3368
const ENERGY_PER_TON = 41000 // MJ/t

export function computeCB(actualGhg:number, fuelConsumptionT:number){
  const energy = fuelConsumptionT * ENERGY_PER_TON
  return (TARGET - actualGhg) * energy
}

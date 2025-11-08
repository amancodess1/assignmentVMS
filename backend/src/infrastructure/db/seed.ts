import { PrismaClient } from '@prisma/client'
import { computeCB } from '../../core/application/computeCB'

const prisma = new PrismaClient()

async function main(){
  console.log('Clearing existing data...')
  
  // Clear all tables
  await prisma.bank_entries.deleteMany()
  await prisma.pool_members.deleteMany()
  await prisma.allocations.deleteMany()
  await prisma.pools.deleteMany()
  await prisma.ship_compliance.deleteMany()
  await prisma.routes.deleteMany()

  console.log('Seeding routes...')
  // Seed routes from specification
  const routesData = [
    { route_id: 'R001', vessel_type: 'Container', fuel_type: 'HFO', year: 2024, ghg_intensity: 91.0, fuel_consumption: 5000, distance_km: 12000, total_emissions: 4500, is_baseline: true },
    { route_id: 'R002', vessel_type: 'BulkCarrier', fuel_type: 'LNG', year: 2024, ghg_intensity: 88.0, fuel_consumption: 4800, distance_km: 11500, total_emissions: 4200, is_baseline: false },
    { route_id: 'R003', vessel_type: 'Tanker', fuel_type: 'MGO', year: 2024, ghg_intensity: 93.5, fuel_consumption: 5100, distance_km: 12500, total_emissions: 4700, is_baseline: false },
    { route_id: 'R004', vessel_type: 'RoRo', fuel_type: 'HFO', year: 2025, ghg_intensity: 89.2, fuel_consumption: 4900, distance_km: 11800, total_emissions: 4300, is_baseline: false },
    { route_id: 'R005', vessel_type: 'Container', fuel_type: 'LNG', year: 2025, ghg_intensity: 90.5, fuel_consumption: 4950, distance_km: 11900, total_emissions: 4400, is_baseline: false }
  ]
  
  for(const r of routesData){
    await prisma.routes.create({data: r})
  }

  console.log('Calculating compliance balances...')
  // Calculate and seed compliance balances for sample ships
  const ships = ['SHIP001', 'SHIP002', 'SHIP003']
  
  // Calculate CB values once
  const routes2024 = await prisma.routes.findMany({ where: { year: 2024 } })
  const cb2024 = routes2024.reduce((sum, route) => 
    sum + computeCB(route.ghg_intensity, route.fuel_consumption), 0
  )
  
  const routes2025 = await prisma.routes.findMany({ where: { year: 2025 } })
  const cb2025 = routes2025.reduce((sum, route) => 
    sum + computeCB(route.ghg_intensity, route.fuel_consumption), 0
  )
  
  for (const shipId of ships) {
    await prisma.ship_compliance.upsert({
      where: { ship_id_year_unique: { ship_id: shipId, year: 2024 } },
      update: { cb_gco2eq: cb2024 },
      create: { ship_id: shipId, year: 2024, cb_gco2eq: cb2024 }
    })
    
    await prisma.ship_compliance.upsert({
      where: { ship_id_year_unique: { ship_id: shipId, year: 2025 } },
      update: { cb_gco2eq: cb2025 },
      create: { ship_id: shipId, year: 2025, cb_gco2eq: cb2025 }
    })
  }

  console.log('Adding sample banking records...')
  // Add some sample banking records for SHIP001
  if (cb2024 > 0) {
    await prisma.bank_entries.create({
      data: {
        ship_id: 'SHIP001',
        year: 2024,
        amount_gco2eq: 50000 // Sample banked amount
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${routesData.length} routes created`)
  console.log(`   - ${ships.length} ships with compliance records for 2024 and 2025`)
  console.log(`   - Sample banking records added`)
}

main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())

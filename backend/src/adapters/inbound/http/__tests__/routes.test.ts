import request from 'supertest';
import app from '../../../infrastructure/server/dev-server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Routes API', () => {
  beforeAll(async () => {
    await prisma.routes.deleteMany();
    await prisma.routes.createMany({
      data: [
        { route_id: 'R001', vessel_type: 'Container', fuel_type: 'HFO', year: 2024, ghg_intensity: 91.0, fuel_consumption: 5000, distance_km: 12000, total_emissions: 4500, is_baseline: true },
        { route_id: 'R002', vessel_type: 'BulkCarrier', fuel_type: 'LNG', year: 2024, ghg_intensity: 88.0, fuel_consumption: 4800, distance_km: 11500, total_emissions: 4200 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fetch all routes', async () => {
    const response = await request(app).get('/api/routes');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('should set a baseline route', async () => {
    const response = await request(app).post('/api/routes/2/baseline');
    expect(response.status).toBe(200);

    const baseline = await prisma.routes.findFirst({ where: { is_baseline: true } });
    expect(baseline?.id).toBe(2);
  });

  it('should fetch comparison data', async () => {
    const response = await request(app).get('/api/routes/comparison');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('percentDiff');
  });
});
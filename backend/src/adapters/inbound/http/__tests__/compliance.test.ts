import request from 'supertest';
import app from '../../../../infrastructure/server/dev-server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Compliance API', () => {
  beforeAll(async () => {
    await prisma.routes.deleteMany();
    await prisma.ship_compliance.deleteMany();
    
    // Create test routes
    await prisma.routes.createMany({
      data: [
        { route_id: 'R001', vessel_type: 'Container', fuel_type: 'HFO', year: 2024, ghg_intensity: 91.0, fuel_consumption: 5000, distance_km: 12000, total_emissions: 4500 },
        { route_id: 'R002', vessel_type: 'BulkCarrier', fuel_type: 'LNG', year: 2024, ghg_intensity: 88.0, fuel_consumption: 4800, distance_km: 11500, total_emissions: 4200 },
      ],
    });
  });

  afterAll(async () => {
    await prisma.routes.deleteMany();
    await prisma.ship_compliance.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/compliance/cb', () => {
    it('should calculate compliance balance for a year', async () => {
      const response = await request(app)
        .get('/api/compliance/cb')
        .query({ year: 2024 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cb');
      expect(response.body).toHaveProperty('cb_before');
      expect(typeof response.body.cb).toBe('number');
    });

    it('should calculate and store CB when shipId is provided', async () => {
      const response = await request(app)
        .get('/api/compliance/cb')
        .query({ shipId: 'TEST_SHIP', year: 2024 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cb');

      // Verify it was stored
      const compliance = await prisma.ship_compliance.findUnique({
        where: { ship_id_year_unique: { ship_id: 'TEST_SHIP', year: 2024 } },
      });
      expect(compliance).not.toBeNull();
      expect(compliance?.cb_gco2eq).toBe(response.body.cb);
    });

    it('should use current year when year is not provided', async () => {
      const currentYear = new Date().getFullYear();
      const response = await request(app)
        .get('/api/compliance/cb');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cb');
    });
  });

  describe('GET /api/compliance/adjusted-cb', () => {
    beforeEach(async () => {
      await prisma.bank_entries.deleteMany();
      await prisma.ship_compliance.upsert({
        where: { ship_id_year_unique: { ship_id: 'TEST_SHIP', year: 2024 } },
        update: { cb_gco2eq: 10000 },
        create: { ship_id: 'TEST_SHIP', year: 2024, cb_gco2eq: 10000 },
      });
    });

    it('should calculate adjusted CB with bank entries', async () => {
      // Ensure compliance exists
      await prisma.ship_compliance.upsert({
        where: { ship_id_year_unique: { ship_id: 'TEST_SHIP', year: 2024 } },
        update: { cb_gco2eq: 10000 },
        create: { ship_id: 'TEST_SHIP', year: 2024, cb_gco2eq: 10000 },
      });

      await prisma.bank_entries.create({
        data: {
          ship_id: 'TEST_SHIP',
          year: 2024,
          amount_gco2eq: 2000,
        },
      });

      const response = await request(app)
        .get('/api/compliance/adjusted-cb')
        .query({ shipId: 'TEST_SHIP', year: 2024 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('adjustedCB');
      expect(response.body).toHaveProperty('cb_before');
      expect(response.body).toHaveProperty('bankAdjustment');
      expect(response.body.adjustedCB).toBe(12000); // 10000 + 2000
    });

    it('should return error when shipId or year is missing', async () => {
      const response = await request(app)
        .get('/api/compliance/adjusted-cb')
        .query({ shipId: 'TEST_SHIP' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('shipId and year are required');
    });

    it('should return error when compliance record not found', async () => {
      const response = await request(app)
        .get('/api/compliance/adjusted-cb')
        .query({ shipId: 'NONEXISTENT', year: 2024 });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Compliance record not found');
    });
  });
});


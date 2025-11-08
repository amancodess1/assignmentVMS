import request from 'supertest';
import app from '../../../../infrastructure/server/dev-server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Banking API', () => {
  beforeAll(async () => {
    // Clean up
    await prisma.bank_entries.deleteMany();
    await prisma.ship_compliance.deleteMany();
    
    // Create test compliance record
    await prisma.ship_compliance.upsert({
      where: { ship_id_year_unique: { ship_id: 'TEST_SHIP', year: 2024 } },
      update: { cb_gco2eq: 10000 },
      create: { ship_id: 'TEST_SHIP', year: 2024, cb_gco2eq: 10000 },
    });
  });

  afterAll(async () => {
    await prisma.bank_entries.deleteMany();
    await prisma.ship_compliance.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/banking/bank', () => {
    beforeEach(async () => {
      // Ensure compliance record exists with positive CB
      await prisma.ship_compliance.upsert({
        where: { ship_id_year_unique: { ship_id: 'TEST_SHIP', year: 2024 } },
        update: { cb_gco2eq: 10000 },
        create: { ship_id: 'TEST_SHIP', year: 2024, cb_gco2eq: 10000 },
      });
      // Clear bank entries
      await prisma.bank_entries.deleteMany({ where: { ship_id: 'TEST_SHIP', year: 2024 } });
    });

    it('should bank surplus successfully', async () => {
      const response = await request(app)
        .post('/api/banking/bank')
        .send({
          shipId: 'TEST_SHIP',
          year: 2024,
          amount: 5000,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applied');
      expect(response.body).toHaveProperty('remaining');
      expect(response.body.applied).toBe(5000);
    });

    it('should return error when CB is zero or negative', async () => {
      await prisma.ship_compliance.upsert({
        where: { ship_id_year_unique: { ship_id: 'TEST_SHIP', year: 2024 } },
        update: { cb_gco2eq: 0 },
        create: { ship_id: 'TEST_SHIP', year: 2024, cb_gco2eq: 0 },
      });

      const response = await request(app)
        .post('/api/banking/bank')
        .send({
          shipId: 'TEST_SHIP',
          year: 2024,
          amount: 1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No positive compliance balance');
    });

    it('should return error when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/banking/bank')
        .send({
          shipId: 'TEST_SHIP',
          // missing year and amount
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/banking/apply', () => {
    beforeEach(async () => {
      // Create banked entries
      await prisma.bank_entries.deleteMany();
      await prisma.bank_entries.create({
        data: {
          ship_id: 'TEST_SHIP',
          year: 2024,
          amount_gco2eq: 5000,
        },
      });
    });

    it('should apply banked surplus successfully', async () => {
      const response = await request(app)
        .post('/api/banking/apply')
        .send({
          shipId: 'TEST_SHIP',
          year: 2024,
          amount: 3000,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('applied');
      expect(response.body).toHaveProperty('remaining');
    });

    it('should return error when no banked surplus available', async () => {
      await prisma.bank_entries.deleteMany();

      const response = await request(app)
        .post('/api/banking/apply')
        .send({
          shipId: 'TEST_SHIP',
          year: 2024,
          amount: 1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No banked surplus available');
    });
  });

  describe('GET /api/banking/records', () => {
    beforeEach(async () => {
      await prisma.bank_entries.deleteMany();
      await prisma.bank_entries.createMany({
        data: [
          { ship_id: 'TEST_SHIP', year: 2024, amount_gco2eq: 5000 },
          { ship_id: 'TEST_SHIP', year: 2024, amount_gco2eq: -2000 },
        ],
      });
    });

    it('should fetch banking records', async () => {
      const response = await request(app)
        .get('/api/banking/records')
        .query({ shipId: 'TEST_SHIP', year: 2024 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter records by shipId and year', async () => {
      const response = await request(app)
        .get('/api/banking/records')
        .query({ shipId: 'TEST_SHIP', year: 2024 });

      expect(response.status).toBe(200);
      response.body.forEach((record: any) => {
        expect(record.ship_id).toBe('TEST_SHIP');
        expect(record.year).toBe(2024);
      });
    });
  });
});


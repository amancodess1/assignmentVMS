import request from 'supertest';
import app from '../../../../infrastructure/server/dev-server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Pools API', () => {
  beforeAll(async () => {
    await prisma.pool_members.deleteMany();
    await prisma.pools.deleteMany();
  });

  afterAll(async () => {
    await prisma.pool_members.deleteMany();
    await prisma.pools.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/pools', () => {
    it('should create a pool with members', async () => {
      const response = await request(app)
        .post('/api/pools')
        .send({
          year: 2024,
          members: [
            { shipId: 'SHIP1', cb: 1000 },
            { shipId: 'SHIP2', cb: -500 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('poolId');
      expect(response.body).toHaveProperty('allocations');
      expect(response.body.allocations).toHaveLength(2);
    });

    it('should return error when year is missing', async () => {
      const response = await request(app)
        .post('/api/pools')
        .send({
          members: [{ shipId: 'SHIP1', cb: 1000 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('year and members array are required');
    });

    it('should return error when members is not an array', async () => {
      const response = await request(app)
        .post('/api/pools')
        .send({
          year: 2024,
          members: 'not an array',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/pools/adjusted-cb', () => {
    let poolId: number;

    beforeEach(async () => {
      // Create a test pool
      const pool = await prisma.pools.create({ data: { year: 2024 } });
      poolId = pool.id;
      
      await prisma.pool_members.createMany({
        data: [
          { pool_id: poolId, ship_id: 'SHIP1', cb_before: 1000, cb_after: 500 },
          { pool_id: poolId, ship_id: 'SHIP2', cb_before: -500, cb_after: 0 },
        ],
      });
    });

    it('should fetch adjusted CB for a pool', async () => {
      const response = await request(app)
        .get('/api/pools/adjusted-cb')
        .query({ poolId });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('adjustedCB');
      expect(response.body).toHaveProperty('members');
      expect(response.body.adjustedCB).toBe(500); // 500 + 0
    });

    it('should return error when poolId is missing', async () => {
      const response = await request(app)
        .get('/api/pools/adjusted-cb');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('poolId is required');
    });

    it('should return error when pool not found', async () => {
      const response = await request(app)
        .get('/api/pools/adjusted-cb')
        .query({ poolId: 99999 });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Pool not found');
    });
  });
});


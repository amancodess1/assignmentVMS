import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createPool } from '../../../core/application/createPool';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { year, members } = req.body;
  if (!year || !members || !Array.isArray(members)) {
    return res.status(400).json({ error: 'year and members array are required' });
  }

  try {
    const poolMembers = members.map((m) => ({ shipId: m.shipId, cb: m.cb }));
    const allocations = createPool(poolMembers);

    const pool = await prisma.pools.create({ data: { year } });

    for (const allocation of allocations) {
      await prisma.pool_members.create({
        data: {
          pool_id: pool.id,
          ship_id: allocation.shipId,
          cb_before: allocation.cb_before,
          cb_after: allocation.cb_after,
        },
      });
    }

    res.json({ poolId: pool.id, allocations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pool' });
  }
});

export default router;
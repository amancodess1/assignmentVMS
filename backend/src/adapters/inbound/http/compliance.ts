import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { computeCB } from '../../../core/application/computeCB';

const router = Router();
const prisma = new PrismaClient();

router.get('/cb', async (req, res) => {
  const { shipId, year } = req.query;
  if (!shipId || !year) {
    return res.status(400).json({ error: 'shipId and year are required' });
  }

  try {
    const routes = await prisma.routes.findMany({ where: { year: Number(year) } });
    const cb = routes.reduce((sum, route) => sum + computeCB(route.ghg_intensity, route.fuel_consumption), 0);

    await prisma.ship_compliance.upsert({
      where: { ship_id_year: { ship_id: String(shipId), year: Number(year) } },
      update: { cb_gco2eq: cb },
      create: { ship_id: String(shipId), year: Number(year), cb_gco2eq: cb },
    });

    res.json({ cb });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate compliance balance' });
  }
});

export default router;
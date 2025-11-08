import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { bankSurplus, applyBanked } from '../../../core/application/banking';

const router = Router();
const prisma = new PrismaClient();

router.post('/bank', async (req, res) => {
  const { shipId, year, amount } = req.body;
  if (!shipId || !year || !amount) {
    return res.status(400).json({ error: 'shipId, year, and amount are required' });
  }

  try {
    const compliance = await prisma.ship_compliance.findUnique({ where: { ship_id_year: { ship_id: shipId, year } } });
    if (!compliance || compliance.cb_gco2eq <= 0) {
      return res.status(400).json({ error: 'No positive compliance balance available' });
    }

    const { applied, remaining } = bankSurplus(compliance.cb_gco2eq, amount);

    await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: applied } });
    await prisma.ship_compliance.update({ where: { ship_id_year: { ship_id: shipId, year } }, data: { cb_gco2eq: remaining } });

    res.json({ applied, remaining });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bank surplus' });
  }
});

router.post('/apply', async (req, res) => {
  const { shipId, year, amount } = req.body;
  if (!shipId || !year || !amount) {
    return res.status(400).json({ error: 'shipId, year, and amount are required' });
  }

  try {
    const banked = await prisma.bank_entries.findMany({ where: { ship_id: shipId, year } });
    const totalBanked = banked.reduce((sum, entry) => sum + entry.amount_gco2eq, 0);

    const { applied, remaining } = applyBanked(totalBanked, amount);

    await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: -applied } });

    res.json({ applied, remaining });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply banked surplus' });
  }
});

export default router;
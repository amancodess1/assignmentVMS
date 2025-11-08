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
    const compliance = await prisma.ship_compliance.findUnique({ where: { ship_id_year_unique: { ship_id: shipId, year } } });
    if (!compliance || compliance.cb_gco2eq <= 0) {
      return res.status(400).json({ error: 'No positive compliance balance available' });
    }

    const { applied, remaining } = bankSurplus(compliance.cb_gco2eq, amount);

    await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: applied } });
    await prisma.ship_compliance.update({ where: { ship_id_year_unique: { ship_id: shipId, year } }, data: { cb_gco2eq: remaining } });

    res.json({ applied, remaining });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bank surplus' });
  }
});

router.get('/records', async (req, res) => {
  const { shipId, year } = req.query;
  
  try {
    const where: any = {};
    if (shipId) where.ship_id = String(shipId);
    if (year) where.year = Number(year);

    const records = await prisma.bank_entries.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banking records' });
  }
});

router.post('/apply', async (req, res) => {
  const { shipId, year, amount } = req.body;
  if (!shipId || !year || !amount) {
    return res.status(400).json({ error: 'shipId, year, and amount are required' });
  }

  try {
    const banked = await prisma.bank_entries.findMany({ 
      where: { ship_id: shipId, year, amount_gco2eq: { gt: 0 } } 
    });
    const totalBanked = banked.reduce((sum, entry) => sum + entry.amount_gco2eq, 0);

    if (totalBanked <= 0) {
      return res.status(400).json({ error: 'No banked surplus available' });
    }

    const { applied, remaining } = applyBanked(totalBanked, amount);

    await prisma.bank_entries.create({ data: { ship_id: shipId, year, amount_gco2eq: -applied } });

    // Update compliance balance
    const compliance = await prisma.ship_compliance.findUnique({ 
      where: { ship_id_year_unique: { ship_id: shipId, year } } 
    });
    if (compliance) {
      await prisma.ship_compliance.update({
        where: { ship_id_year_unique: { ship_id: shipId, year } },
        data: { cb_gco2eq: compliance.cb_gco2eq + applied },
      });
    }

    res.json({ applied, remaining });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to apply banked surplus' });
  }
});

export default router;
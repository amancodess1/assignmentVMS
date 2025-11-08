import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { computeCB } from '../../../core/application/computeCB';

const router = Router();
const prisma = new PrismaClient();

router.get('/cb', async (req, res) => {
  const { shipId, year } = req.query;
  const queryYear = year ? Number(year) : new Date().getFullYear();

  try {
    // If shipId is provided, filter by ship_id from routes, otherwise calculate for all routes
    let routes;
    if (shipId) {
      // For now, we'll use all routes for the year since routes don't have ship_id
      // In a real system, routes would be linked to ships
      routes = await prisma.routes.findMany({ where: { year: queryYear } });
    } else {
      routes = await prisma.routes.findMany({ where: { year: queryYear } });
    }

    const cb = routes.reduce((sum, route) => sum + computeCB(route.ghg_intensity, route.fuel_consumption), 0);

    // Store in compliance table if shipId provided
    if (shipId) {
      await prisma.ship_compliance.upsert({
        where: { ship_id_year_unique: { ship_id: String(shipId), year: queryYear } },
        update: { cb_gco2eq: cb },
        create: { ship_id: String(shipId), year: queryYear, cb_gco2eq: cb },
      });
    }

    res.json({ cb, cb_before: cb });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate compliance balance' });
  }
});

router.get('/adjusted-cb', async (req, res) => {
  const { shipId, year } = req.query;
  if (!shipId || !year) {
    return res.status(400).json({ error: 'shipId and year are required' });
  }

  try {
    // Get base CB
    const compliance = await prisma.ship_compliance.findUnique({
      where: { ship_id_year_unique: { ship_id: String(shipId), year: Number(year) } },
    });

    if (!compliance) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }

    // Get all bank entries for this ship/year
    const bankEntries = await prisma.bank_entries.findMany({
      where: { ship_id: String(shipId), year: Number(year) },
    });

    // Calculate adjusted CB: base CB + sum of all bank entries
    const bankAdjustment = bankEntries.reduce((sum, entry) => sum + entry.amount_gco2eq, 0);
    const adjustedCB = compliance.cb_gco2eq + bankAdjustment;

    res.json({ 
      shipId: String(shipId),
      year: Number(year),
      cb_before: compliance.cb_gco2eq,
      bankAdjustment,
      adjustedCB 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch adjusted compliance balance' });
  }
});

export default router;
import { Router } from 'express'
import { PrismaClient } from '@prisma/client';

const router = Router()
const prisma = new PrismaClient();

// lightweight in-memory mock logic for dev seed
let store = [] as any[]

router.get('/', async (req, res) => {
  try {
    const routes = await prisma.routes.findMany();
    res.json(routes);
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ error: 'Failed to fetch routes', details: error.message });
  }
})

router.post('/:id/baseline', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.routes.updateMany({
      data: { is_baseline: false },
    });
    await prisma.routes.update({
      where: { id },
      data: { is_baseline: true },
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set baseline' });
  }
})

router.get('/comparison', async (req, res) => {
  try {
    const baseline = await prisma.routes.findFirst({ where: { is_baseline: true } });
    const others = await prisma.routes.findMany({ where: { is_baseline: false } });

    if (!baseline) {
      return res.status(400).json({ error: 'No baseline route set' });
    }

    const result = others.map((route) => {
      const percentDiff = ((route.ghg_intensity / baseline.ghg_intensity) - 1) * 100;
      return {
        routeId: route.route_id,
        baseline,
        comparison: route,
        percentDiff,
        compliant: route.ghg_intensity <= 89.3368,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
})

export default router

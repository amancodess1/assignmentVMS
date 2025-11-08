export async function getRoutes() {
  const r = await fetch('/api/routes');
  if (!r.ok) throw new Error('Failed to fetch routes');
  return r.json();
}

export async function setBaseline(routeId: number) {
  const r = await fetch(`/api/routes/${routeId}/baseline`, { method: 'POST' });
  if (!r.ok) throw new Error('Failed to set baseline');
  return r.json();
}

export async function getComparison() {
  const r = await fetch('/api/routes/comparison');
  if (!r.ok) throw new Error('Failed to fetch comparison data');
  return r.json();
}

export async function getComplianceBalance(year: number, shipId?: string) {
  const url = shipId 
    ? `/api/compliance/cb?year=${year}&shipId=${shipId}`
    : `/api/compliance/cb?year=${year}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Failed to fetch compliance balance');
  return r.json();
}

export async function bankSurplus(shipId: string, year: number, amount: number) {
  const r = await fetch('/api/banking/bank', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipId, year, amount }),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to bank surplus');
  }
  return r.json();
}

export async function applyBanked(shipId: string, year: number, amount: number) {
  const r = await fetch('/api/banking/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipId, year, amount }),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to apply banked surplus');
  }
  return r.json();
}

export async function createPool(year: number, members: Array<{ shipId: string; cb: number }>) {
  const r = await fetch('/api/pools/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, members }),
  });
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to create pool');
  }
  return r.json();
}

export async function getAdjustedCB(poolId: number) {
  const r = await fetch(`/api/pools/adjusted-cb?poolId=${poolId}`);
  if (!r.ok) {
    const error = await r.json();
    throw new Error(error.error || 'Failed to fetch adjusted CB');
  }
  return r.json();
}

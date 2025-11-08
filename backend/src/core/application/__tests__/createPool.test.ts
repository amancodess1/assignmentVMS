import { describe, it, expect } from 'vitest';
import { createPool } from '../createPool';

describe('createPool', () => {
  it('should transfer surplus to deficit ships', () => {
    const members = [
      { shipId: 'SHIP1', cb: 1000 }, // surplus
      { shipId: 'SHIP2', cb: -500 }, // deficit
    ];
    
    const result = createPool(members);
    
    expect(result).toHaveLength(2);
    
    const ship1 = result.find(r => r.shipId === 'SHIP1');
    const ship2 = result.find(r => r.shipId === 'SHIP2');
    
    expect(ship1?.cb_before).toBe(1000);
    expect(ship1?.cb_after).toBe(500); // gave 500 to SHIP2
    expect(ship2?.cb_before).toBe(-500);
    expect(ship2?.cb_after).toBe(0); // received 500
  });

  it('should handle multiple surplus and deficit ships', () => {
    const members = [
      { shipId: 'SHIP1', cb: 1000 },
      { shipId: 'SHIP2', cb: 500 },
      { shipId: 'SHIP3', cb: -300 },
      { shipId: 'SHIP4', cb: -700 },
    ];
    
    const result = createPool(members);
    
    const totalBefore = result.reduce((sum, r) => sum + r.cb_before, 0);
    const totalAfter = result.reduce((sum, r) => sum + r.cb_after, 0);
    
    // Total should remain the same
    expect(totalAfter).toBe(totalBefore);
    
    // All deficits should be covered or improved
    const ship3 = result.find(r => r.shipId === 'SHIP3');
    const ship4 = result.find(r => r.shipId === 'SHIP4');
    expect(ship3?.cb_after).toBeGreaterThanOrEqual(ship3?.cb_before);
    expect(ship4?.cb_after).toBeGreaterThanOrEqual(ship4?.cb_before);
  });

  it('should not make surplus ships negative', () => {
    const members = [
      { shipId: 'SHIP1', cb: 500 },
      { shipId: 'SHIP2', cb: -1000 },
    ];
    
    const result = createPool(members);
    
    const ship1 = result.find(r => r.shipId === 'SHIP1');
    expect(ship1?.cb_after).toBeGreaterThanOrEqual(0);
  });

  it('should not make deficit ships worse', () => {
    const members = [
      { shipId: 'SHIP1', cb: 1000 },
      { shipId: 'SHIP2', cb: -500 },
    ];
    
    const result = createPool(members);
    
    const ship2 = result.find(r => r.shipId === 'SHIP2');
    expect(ship2?.cb_after).toBeGreaterThanOrEqual(ship2?.cb_before);
  });

  it('should handle all surplus ships', () => {
    const members = [
      { shipId: 'SHIP1', cb: 1000 },
      { shipId: 'SHIP2', cb: 500 },
    ];
    
    const result = createPool(members);
    
    expect(result).toHaveLength(2);
    result.forEach(r => {
      expect(r.cb_after).toBe(r.cb_before);
    });
  });

  it('should handle all deficit ships', () => {
    const members = [
      { shipId: 'SHIP1', cb: -500 },
      { shipId: 'SHIP2', cb: -300 },
    ];
    
    const result = createPool(members);
    
    expect(result).toHaveLength(2);
    result.forEach(r => {
      expect(r.cb_after).toBe(r.cb_before);
    });
  });

  it('should preserve total CB sum', () => {
    const members = [
      { shipId: 'SHIP1', cb: 1000 },
      { shipId: 'SHIP2', cb: -500 },
      { shipId: 'SHIP3', cb: 200 },
      { shipId: 'SHIP4', cb: -300 },
    ];
    
    const result = createPool(members);
    
    const totalBefore = result.reduce((sum, r) => sum + r.cb_before, 0);
    const totalAfter = result.reduce((sum, r) => sum + r.cb_after, 0);
    
    expect(totalAfter).toBe(totalBefore);
  });
});


import { describe, it, expect } from 'vitest';
import { computeCB } from '../computeCB';

describe('computeCB', () => {
  const TARGET = 89.3368;
  const ENERGY_PER_TON = 41000;

  it('should calculate positive CB when GHG intensity is below target', () => {
    const ghgIntensity = 85.0;
    const fuelConsumption = 1000;
    const result = computeCB(ghgIntensity, fuelConsumption);
    
    const expectedEnergy = fuelConsumption * ENERGY_PER_TON;
    const expectedCB = (TARGET - ghgIntensity) * expectedEnergy;
    
    expect(result).toBe(expectedCB);
    expect(result).toBeGreaterThan(0);
  });

  it('should calculate negative CB when GHG intensity is above target', () => {
    const ghgIntensity = 95.0;
    const fuelConsumption = 1000;
    const result = computeCB(ghgIntensity, fuelConsumption);
    
    const expectedEnergy = fuelConsumption * ENERGY_PER_TON;
    const expectedCB = (TARGET - ghgIntensity) * expectedEnergy;
    
    expect(result).toBe(expectedCB);
    expect(result).toBeLessThan(0);
  });

  it('should calculate zero CB when GHG intensity equals target', () => {
    const ghgIntensity = TARGET;
    const fuelConsumption = 1000;
    const result = computeCB(ghgIntensity, fuelConsumption);
    
    expect(result).toBe(0);
  });

  it('should handle large fuel consumption values', () => {
    const ghgIntensity = 90.0;
    const fuelConsumption = 10000;
    const result = computeCB(ghgIntensity, fuelConsumption);
    
    const expectedEnergy = fuelConsumption * ENERGY_PER_TON;
    const expectedCB = (TARGET - ghgIntensity) * expectedEnergy;
    
    expect(result).toBeCloseTo(expectedCB, 2);
  });

  it('should handle zero fuel consumption', () => {
    const ghgIntensity = 90.0;
    const fuelConsumption = 0;
    const result = computeCB(ghgIntensity, fuelConsumption);
    
    expect(result).toBeCloseTo(0, 5);
  });
});


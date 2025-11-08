import { describe, it, expect } from 'vitest';
import { bankSurplus, applyBanked } from '../banking';

describe('bankSurplus', () => {
  it('should bank the exact amount when available', () => {
    const available = 1000;
    const amount = 500;
    const result = bankSurplus(available, amount);
    
    expect(result.applied).toBe(500);
    expect(result.remaining).toBe(500);
  });

  it('should throw error when amount is negative', () => {
    const available = 1000;
    const amount = -100;
    
    expect(() => bankSurplus(available, amount)).toThrow('amount must be positive');
  });

  it('should throw error when amount exceeds available', () => {
    const available = 1000;
    const amount = 1500;
    
    expect(() => bankSurplus(available, amount)).toThrow('insufficient available');
  });

  it('should bank all available when amount equals available', () => {
    const available = 1000;
    const amount = 1000;
    const result = bankSurplus(available, amount);
    
    expect(result.applied).toBe(1000);
    expect(result.remaining).toBe(0);
  });
});

describe('applyBanked', () => {
  it('should apply the exact amount when available is sufficient', () => {
    const available = 1000;
    const toApply = 500;
    const result = applyBanked(available, toApply);
    
    expect(result.applied).toBe(500);
    expect(result.remaining).toBe(500);
  });

  it('should apply only available amount when toApply exceeds available', () => {
    const available = 500;
    const toApply = 1000;
    const result = applyBanked(available, toApply);
    
    expect(result.applied).toBe(500);
    expect(result.remaining).toBe(0);
  });

  it('should throw error when toApply is negative', () => {
    const available = 1000;
    const toApply = -100;
    
    expect(() => applyBanked(available, toApply)).toThrow('toApply must be positive');
  });

  it('should handle zero available', () => {
    const available = 0;
    const toApply = 500;
    const result = applyBanked(available, toApply);
    
    expect(result.applied).toBe(0);
    expect(result.remaining).toBe(0);
  });

  it('should handle zero toApply', () => {
    const available = 1000;
    const toApply = 0;
    const result = applyBanked(available, toApply);
    
    expect(result.applied).toBe(0);
    expect(result.remaining).toBe(1000);
  });
});


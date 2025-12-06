import {
  calculateDeviation,
  calculateWeightedAverage,
  calculateStandardDeviation,
  removeOutliers,
  formatCurrency,
  formatPercentage,
  clamp,
} from '../utils/math';

describe('Math Utilities', () => {
  describe('calculateDeviation', () => {
    it('should calculate percentage deviation correctly', () => {
      expect(calculateDeviation(1.01, 1.0)).toBeCloseTo(1.0, 2);
      expect(calculateDeviation(0.99, 1.0)).toBeCloseTo(1.0, 2);
      expect(calculateDeviation(1.05, 1.0)).toBeCloseTo(5.0, 2);
      expect(calculateDeviation(1.0, 1.0)).toBe(0);
    });
  });

  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average correctly', () => {
      const prices = [
        { price: 1.0, weight: 1 },
        { price: 1.02, weight: 1 },
        { price: 0.99, weight: 1 },
      ];
      const avg = calculateWeightedAverage(prices);
      expect(avg).toBeCloseTo(1.003, 2);
    });

    it('should handle single price', () => {
      const prices = [{ price: 1.0, weight: 1 }];
      expect(calculateWeightedAverage(prices)).toBe(1.0);
    });

    it('should handle empty array', () => {
      expect(calculateWeightedAverage([])).toBe(0);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should calculate standard deviation', () => {
      const values = [1.0, 1.01, 0.99, 1.02, 0.98];
      const stdDev = calculateStandardDeviation(values);
      expect(stdDev).toBeGreaterThan(0);
      expect(stdDev).toBeLessThan(0.02);
    });

    it('should return 0 for empty array', () => {
      expect(calculateStandardDeviation([])).toBe(0);
    });
  });

  describe('removeOutliers', () => {
    it('should remove outliers using IQR method', () => {
      const values = [1.0, 1.01, 0.99, 1.02, 0.98, 5.0]; // 5.0 is outlier
      const cleaned = removeOutliers(values);
      expect(cleaned.length).toBeLessThan(values.length);
      expect(cleaned).not.toContain(5.0);
    });

    it('should return all values if less than 4', () => {
      const values = [1.0, 1.01, 0.99];
      expect(removeOutliers(values)).toEqual(values);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1.0)).toBe('$1.0000');
      expect(formatCurrency(1.0012, 4)).toBe('$1.0012');
      expect(formatCurrency(0.9988, 4)).toBe('$0.9988');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(1.5)).toBe('1.50%');
      expect(formatPercentage(0.05, 3)).toBe('0.050%');
    });
  });

  describe('clamp', () => {
    it('should clamp values correctly', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });
  });
});


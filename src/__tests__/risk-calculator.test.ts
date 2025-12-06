import { RiskCalculator } from '../core/risk-calculator';
import { PriceData, AggregatedPrice, LiquidityInfo } from '../types';

describe('RiskCalculator', () => {
  let calculator: RiskCalculator;

  beforeEach(() => {
    calculator = new RiskCalculator({
      depegWarning: 0.5,
      depegCritical: 2.0,
      riskHigh: 70,
      riskMedium: 40,
    });
  });

  describe('aggregatePrices', () => {
    it('should aggregate prices from multiple sources', () => {
      const priceData: PriceData[] = [
        { price: 1.0, source: 'Source1', timestamp: Date.now() },
        { price: 1.01, source: 'Source2', timestamp: Date.now() },
        { price: 0.99, source: 'Source3', timestamp: Date.now() },
      ];

      const aggregated = calculator.aggregatePrices(priceData, 1.0);

      expect(aggregated.price).toBeGreaterThan(0.99);
      expect(aggregated.price).toBeLessThan(1.01);
      expect(aggregated.sources).toHaveLength(3);
      expect(aggregated.deviation).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty price data', () => {
      const aggregated = calculator.aggregatePrices([], 1.0);
      expect(aggregated.price).toBe(1.0);
      expect(aggregated.deviation).toBe(0);
      expect(aggregated.sources).toHaveLength(0);
    });

    it('should remove outliers', () => {
      const priceData: PriceData[] = [
        { price: 1.0, source: 'Source1', timestamp: Date.now() },
        { price: 1.01, source: 'Source2', timestamp: Date.now() },
        { price: 0.99, source: 'Source3', timestamp: Date.now() },
        { price: 1.02, source: 'Source4', timestamp: Date.now() },
        { price: 0.98, source: 'Source5', timestamp: Date.now() },
        { price: 5.0, source: 'BadSource', timestamp: Date.now() }, // Outlier
      ];

      const aggregated = calculator.aggregatePrices(priceData, 1.0);

      // Price should be close to 1.0, not affected much by outlier
      expect(aggregated.price).toBeGreaterThan(0.95);
      expect(aggregated.price).toBeLessThan(1.05);
    });
  });

  describe('calculateRiskScore', () => {
    it('should calculate risk score correctly', () => {
      const metrics = {
        priceDeviation: 10,
        liquidityScore: 80,
        volatilityScore: 20,
        volumeScore: 70,
      };

      const score = calculator.calculateRiskScore(metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give high score for bad metrics', () => {
      const metrics = {
        priceDeviation: 90,
        liquidityScore: 10,
        volatilityScore: 90,
        volumeScore: 10,
      };

      const score = calculator.calculateRiskScore(metrics);
      expect(score).toBeGreaterThan(70);
    });

    it('should give low score for good metrics', () => {
      const metrics = {
        priceDeviation: 5,
        liquidityScore: 95,
        volatilityScore: 5,
        volumeScore: 90,
      };

      const score = calculator.calculateRiskScore(metrics);
      expect(score).toBeLessThan(30);
    });
  });

  describe('getRiskLevel', () => {
    it('should categorize risk levels correctly', () => {
      expect(calculator.getRiskLevel(10)).toBe('low');
      expect(calculator.getRiskLevel(30)).toBe('medium');
      expect(calculator.getRiskLevel(50)).toBe('high');
      expect(calculator.getRiskLevel(80)).toBe('critical');
    });
  });

  describe('getHealthStatus', () => {
    it('should return healthy for low deviation and risk', () => {
      const status = calculator.getHealthStatus(0.1, 20);
      expect(status).toBe('healthy');
    });

    it('should return critical for medium-high deviation', () => {
      const status = calculator.getHealthStatus(0.6, 50);
      expect(status).toBe('critical'); // 0.6 > depegWarning threshold
    });

    it('should return depegged for high deviation', () => {
      const status = calculator.getHealthStatus(2.5, 50);
      expect(status).toBe('depegged'); // 2.5 > depegCritical threshold
    });

    it('should return depegged for very high deviation', () => {
      const status = calculator.getHealthStatus(3.0, 95);
      expect(status).toBe('depegged');
    });
  });

  describe('generateAlerts', () => {
    it('should generate alerts for high deviation', () => {
      const alerts = calculator.generateAlerts('USDT', 2.5, 50, {
        priceDeviation: 50,
        liquidityScore: 60,
        volatilityScore: 30,
        volumeScore: 70,
      });

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some((a) => a.includes('CRITICAL'))).toBe(true);
    });

    it('should generate alerts for low liquidity', () => {
      const alerts = calculator.generateAlerts('USDT', 0.1, 50, {
        priceDeviation: 10,
        liquidityScore: 20, // Low liquidity
        volatilityScore: 30,
        volumeScore: 70,
      });

      expect(alerts.some((a) => a.includes('liquidity'))).toBe(true);
    });

    it('should not generate alerts for healthy state', () => {
      const alerts = calculator.generateAlerts('USDT', 0.05, 15, {
        priceDeviation: 5,
        liquidityScore: 90,
        volatilityScore: 10,
        volumeScore: 85,
      });

      expect(alerts.length).toBe(0);
    });
  });
});


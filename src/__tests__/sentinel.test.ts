import { StableSentinel } from '../core/sentinel';
import { resetConfig } from '../config';
import { resetCache } from '../utils/cache';
import { UnsupportedStablecoinError } from '../utils/errors';

// Mock the price provider to avoid real API calls
jest.mock('../providers/price', () => {
  return {
    FallbackPriceProvider: jest.fn().mockImplementation(() => ({
      getPrices: jest.fn().mockResolvedValue([
        { price: 1.0001, source: 'MockProvider', timestamp: Date.now() },
      ]),
      isAvailable: jest.fn().mockResolvedValue(true),
    })),
  };
});

describe('StableSentinel', () => {
  let sentinel: StableSentinel;

  beforeEach(() => {
    resetConfig();
    resetCache();
    sentinel = new StableSentinel({
      rpcUrls: { ethereum: 'https://example.com' },
    });
  });

  afterEach(() => {
    sentinel.stopAllMonitoring();
    resetConfig();
    resetCache();
  });

  describe('getHealth', () => {
    it('should return a health report for a supported stablecoin', async () => {
      const report = await sentinel.getHealth('USDT', 'ethereum');
      expect(report).toBeDefined();
      expect(report.symbol).toBe('USDT');
      expect(report.chain).toBe('ethereum');
      expect(report.price).toBeGreaterThan(0);
      expect(report.riskScore).toBeGreaterThanOrEqual(0);
      expect(report.riskScore).toBeLessThanOrEqual(100);
      expect(report.status).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.liquidity).toBeDefined();
      expect(report.alerts).toBeDefined();
    });

    it('should throw UnsupportedStablecoinError for unknown symbols', async () => {
      await expect(sentinel.getHealth('FAKECOIN')).rejects.toThrow(
        UnsupportedStablecoinError
      );
    });

    it('should use cache on subsequent calls', async () => {
      const report1 = await sentinel.getHealth('USDC', 'ethereum');
      const report2 = await sentinel.getHealth('USDC', 'ethereum');
      // Both should be the same cached report
      expect(report1.timestamp).toBe(report2.timestamp);
    });
  });

  describe('getMultipleHealth', () => {
    it('should return reports for multiple stablecoins', async () => {
      const reports = await sentinel.getMultipleHealth(
        ['USDT', 'USDC'],
        'ethereum'
      );
      expect(reports.length).toBe(2);
      expect(reports[0].symbol).toBe('USDT');
      expect(reports[1].symbol).toBe('USDC');
    });

    it('should skip failed requests gracefully', async () => {
      const reports = await sentinel.getMultipleHealth(
        ['USDT', 'FAKECOIN'],
        'ethereum'
      );
      // Only USDT should succeed
      expect(reports.length).toBe(1);
      expect(reports[0].symbol).toBe('USDT');
    });
  });

  describe('getSupportedStablecoins', () => {
    it('should return list of supported stablecoins', () => {
      const stablecoins = sentinel.getSupportedStablecoins();
      expect(stablecoins.length).toBeGreaterThan(0);
      expect(stablecoins).toContain('USDT');
      expect(stablecoins).toContain('USDC');
    });
  });

  describe('clearCache', () => {
    it('should clear the internal cache', async () => {
      // Fetch data first to populate cache
      await sentinel.getHealth('USDT', 'ethereum');
      sentinel.clearCache();
      // No error means the method works
    });
  });

  describe('checkProviderAvailability', () => {
    it('should return availability status', async () => {
      const available = await sentinel.checkProviderAvailability();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('events', () => {
    it('should emit depeg-warning for critical status', async () => {
      // Override mock to return depegged price
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { FallbackPriceProvider } = require('../providers/price');
      FallbackPriceProvider.mockImplementation(() => ({
        getPrices: jest.fn().mockResolvedValue([
          { price: 0.95, source: 'MockProvider', timestamp: Date.now() },
        ]),
        isAvailable: jest.fn().mockResolvedValue(true),
      }));

      resetConfig();
      resetCache();
      const depegSentinel = new StableSentinel({
        rpcUrls: { ethereum: 'https://example.com' },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const events: any[] = [];
      depegSentinel.on('depeg-warning', (event: any) => events.push(event));

      await depegSentinel.getHealth('USDT', 'ethereum');
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].symbol).toBe('USDT');
      depegSentinel.stopAllMonitoring();
    });
  });

  describe('monitoring', () => {
    it('should start and stop monitoring', () => {
      expect(() => sentinel.startMonitoring('USDT', 'ethereum', 60000)).not.toThrow();
      expect(() => sentinel.stopMonitoring('USDT', 'ethereum')).not.toThrow();
    });

    it('should throw for unsupported stablecoin monitoring', () => {
      expect(() => sentinel.startMonitoring('FAKE')).toThrow(
        UnsupportedStablecoinError
      );
    });

    it('should stop all monitoring', () => {
      sentinel.startMonitoring('USDT', 'ethereum', 60000);
      sentinel.startMonitoring('USDC', 'ethereum', 60000);
      expect(() => sentinel.stopAllMonitoring()).not.toThrow();
    });
  });
});

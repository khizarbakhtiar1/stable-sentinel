import { 
  getStablecoin, 
  getAllStablecoins, 
  isSupported, 
  getStablecoinsByType,
  getAddress 
} from '../data/stablecoins';

describe('Stablecoin Registry', () => {
  describe('getStablecoin', () => {
    it('should return metadata for supported stablecoin', () => {
      const usdt = getStablecoin('USDT');
      expect(usdt).toBeDefined();
      expect(usdt?.symbol).toBe('USDT');
      expect(usdt?.name).toBe('Tether USD');
      expect(usdt?.type).toBe('fiat-backed');
      expect(usdt?.targetPrice).toBe(1.0);
    });

    it('should be case-insensitive', () => {
      const usdt1 = getStablecoin('USDT');
      const usdt2 = getStablecoin('usdt');
      expect(usdt1).toEqual(usdt2);
    });

    it('should return undefined for unsupported stablecoin', () => {
      const unknown = getStablecoin('UNKNOWN');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getAllStablecoins', () => {
    it('should return array of all stablecoin symbols', () => {
      const stablecoins = getAllStablecoins();
      expect(Array.isArray(stablecoins)).toBe(true);
      expect(stablecoins.length).toBeGreaterThan(0);
      expect(stablecoins).toContain('USDT');
      expect(stablecoins).toContain('USDC');
      expect(stablecoins).toContain('DAI');
    });
  });

  describe('isSupported', () => {
    it('should return true for supported stablecoins', () => {
      expect(isSupported('USDT')).toBe(true);
      expect(isSupported('USDC')).toBe(true);
      expect(isSupported('DAI')).toBe(true);
    });

    it('should return false for unsupported stablecoins', () => {
      expect(isSupported('UNKNOWN')).toBe(false);
      expect(isSupported('FAKE')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isSupported('usdt')).toBe(true);
      expect(isSupported('Usdc')).toBe(true);
    });
  });

  describe('getStablecoinsByType', () => {
    it('should return fiat-backed stablecoins', () => {
      const fiatBacked = getStablecoinsByType('fiat-backed');
      expect(fiatBacked.length).toBeGreaterThan(0);
      expect(fiatBacked.every((sc) => sc.type === 'fiat-backed')).toBe(true);
      expect(fiatBacked.some((sc) => sc.symbol === 'USDT')).toBe(true);
    });

    it('should return crypto-collateralized stablecoins', () => {
      const cryptoBacked = getStablecoinsByType('crypto-collateralized');
      expect(cryptoBacked.length).toBeGreaterThan(0);
      expect(cryptoBacked.every((sc) => sc.type === 'crypto-collateralized')).toBe(true);
      expect(cryptoBacked.some((sc) => sc.symbol === 'DAI')).toBe(true);
    });

    it('should return algorithmic stablecoins', () => {
      const algorithmic = getStablecoinsByType('algorithmic');
      expect(algorithmic.every((sc) => sc.type === 'algorithmic')).toBe(true);
    });
  });

  describe('getAddress', () => {
    it('should return address for supported chain', () => {
      const address = getAddress('USDT', 'ethereum');
      expect(address).toBeDefined();
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should return undefined for unsupported chain', () => {
      const address = getAddress('USDT', 'unsupported-chain' as any);
      expect(address).toBeUndefined();
    });

    it('should return undefined for unsupported stablecoin', () => {
      const address = getAddress('UNKNOWN', 'ethereum');
      expect(address).toBeUndefined();
    });
  });

  describe('Stablecoin metadata structure', () => {
    it('should have complete metadata for USDT', () => {
      const usdt = getStablecoin('USDT')!;
      expect(usdt.symbol).toBe('USDT');
      expect(usdt.name).toBeDefined();
      expect(usdt.type).toBeDefined();
      expect(usdt.pegCurrency).toBe('USD');
      expect(usdt.targetPrice).toBe(1.0);
      expect(usdt.decimals).toBe(6);
      expect(usdt.coingeckoId).toBe('tether');
      expect(Object.keys(usdt.addresses).length).toBeGreaterThan(0);
    });

    it('should have addresses for major chains', () => {
      const usdt = getStablecoin('USDT')!;
      expect(usdt.addresses.ethereum).toBeDefined();
      expect(usdt.addresses.bsc).toBeDefined();
      expect(usdt.addresses.polygon).toBeDefined();
    });
  });
});


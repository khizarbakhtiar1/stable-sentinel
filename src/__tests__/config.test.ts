import { ConfigManager, getConfig, resetConfig } from '../config';

describe('ConfigManager', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should create config with defaults', () => {
    const config = new ConfigManager();
    const cfg = config.getConfig();
    expect(cfg.rpcUrls).toBeDefined();
    expect(cfg.cache?.enabled).toBe(true);
    expect(cfg.thresholds?.depegWarning).toBe(0.5);
  });

  it('should merge user config with defaults', () => {
    const config = new ConfigManager({
      rpcUrls: { ethereum: 'https://my-rpc.example.com' },
      thresholds: { depegWarning: 1.0 },
    });
    const cfg = config.getConfig();
    expect(cfg.rpcUrls.ethereum).toBe('https://my-rpc.example.com');
    // Other defaults should still be set
    expect(cfg.rpcUrls.bsc).toBeDefined();
    expect(cfg.thresholds?.depegWarning).toBe(1.0);
    expect(cfg.thresholds?.depegCritical).toBe(2.0);
  });

  it('should return API key', () => {
    const config = new ConfigManager({
      apiKeys: { coingecko: 'test-key' },
    });
    expect(config.getApiKey('coingecko')).toBe('test-key');
    expect(config.getApiKey('coinmarketcap')).toBeUndefined();
  });

  it('should return cache settings', () => {
    const config = new ConfigManager({ cache: { enabled: false, ttl: 120 } });
    const settings = config.getCacheSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.ttl).toBe(120);
  });

  it('should return thresholds', () => {
    const config = new ConfigManager();
    const thresholds = config.getThresholds();
    expect(thresholds.depegWarning).toBe(0.5);
    expect(thresholds.depegCritical).toBe(2.0);
    expect(thresholds.riskHigh).toBe(70);
    expect(thresholds.riskMedium).toBe(40);
  });

  it('should throw for missing RPC URL', () => {
    const config = new ConfigManager({ rpcUrls: {} });
    expect(() => config.getRpcUrl('ethereum')).toThrow('No RPC URL configured');
  });
});

describe('getConfig', () => {
  beforeEach(() => {
    resetConfig();
  });

  it('should create a new instance when userConfig is provided', () => {
    getConfig({ rpcUrls: { ethereum: 'url1' } });
    const config2 = getConfig({ rpcUrls: { ethereum: 'url2' } });
    expect(config2.getConfig().rpcUrls.ethereum).toBe('url2');
  });

  it('should return existing instance when no userConfig provided', () => {
    getConfig({ rpcUrls: { ethereum: 'url1' } });
    const config2 = getConfig();
    expect(config2.getConfig().rpcUrls.ethereum).toBe('url1');
  });
});

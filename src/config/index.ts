import dotenv from 'dotenv';
import { StableSentinelConfig, ChainId } from '../types';

// Load environment variables
dotenv.config();

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: StableSentinelConfig = {
  rpcUrls: {
    ethereum: process.env.ETHEREUM_RPC_URL || '',
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    arbitrum: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    optimism: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    avalanche: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
  },
  apiKeys: {
    coingecko: process.env.COINGECKO_API_KEY,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    coingeckoIsPro: process.env.COINGECKO_IS_PRO === 'true',
  },
  cache: {
    enabled: true,
    ttl: parseInt(process.env.CACHE_TTL || '60'),
  },
  thresholds: {
    depegWarning: parseFloat(process.env.DEPEG_WARNING_THRESHOLD || '0.5'),
    depegCritical: parseFloat(process.env.DEPEG_CRITICAL_THRESHOLD || '2.0'),
    riskHigh: parseInt(process.env.RISK_THRESHOLD_HIGH || '70'),
    riskMedium: parseInt(process.env.RISK_THRESHOLD_MEDIUM || '40'),
  },
};

/**
 * Configuration manager
 */
export class ConfigManager {
  private config: StableSentinelConfig;

  constructor(userConfig?: Partial<StableSentinelConfig>) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, userConfig);
    this.validate();
  }

  /**
   * Get the complete configuration
   */
  getConfig(): StableSentinelConfig {
    return this.config;
  }

  /**
   * Get RPC URL for a specific chain
   */
  getRpcUrl(chain: ChainId): string {
    const url = this.config.rpcUrls[chain];
    if (!url) {
      throw new Error(`No RPC URL configured for chain: ${chain}`);
    }
    return url;
  }

  /**
   * Get API key
   */
  getApiKey(service: 'coingecko' | 'coinmarketcap'): string | undefined {
    return this.config.apiKeys?.[service];
  }

  /**
   * Get cache settings
   */
  getCacheSettings() {
    return this.config.cache || { enabled: true, ttl: 60 };
  }

  /**
   * Get thresholds
   */
  getThresholds() {
    return (
      this.config.thresholds || {
        depegWarning: 0.5,
        depegCritical: 2.0,
        riskHigh: 70,
        riskMedium: 40,
      }
    );
  }

  /**
   * Merge user config with defaults
   */
  private mergeConfig(
    defaultConfig: StableSentinelConfig,
    userConfig?: Partial<StableSentinelConfig>
  ): StableSentinelConfig {
    if (!userConfig) return defaultConfig;

    return {
      rpcUrls: { ...defaultConfig.rpcUrls, ...userConfig.rpcUrls },
      apiKeys: { ...defaultConfig.apiKeys, ...userConfig.apiKeys },
      cache: { ...defaultConfig.cache, ...userConfig.cache },
      thresholds: { ...defaultConfig.thresholds, ...userConfig.thresholds },
    };
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    // Check if at least one RPC URL is configured
    const hasRpcUrl = Object.values(this.config.rpcUrls).some((url) => url && url.length > 0);

    if (!hasRpcUrl) {
      console.warn(
        'Warning: No RPC URLs configured. Some features may not work. Please configure at least one RPC URL.'
      );
    }
  }
}

/**
 * Global config instance
 */
let configInstance: ConfigManager | null = null;

/**
 * Initialize or get config instance
 * When userConfig is provided, always creates a new instance
 */
export function getConfig(userConfig?: Partial<StableSentinelConfig>): ConfigManager {
  if (userConfig) {
    configInstance = new ConfigManager(userConfig);
  }
  if (!configInstance) {
    configInstance = new ConfigManager();
  }
  return configInstance;
}

/**
 * Reset config instance (mainly for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}


/**
 * Supported blockchain networks
 */
export type ChainId = 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche';

/**
 * Stablecoin types
 */
export type StablecoinType = 'fiat-backed' | 'crypto-collateralized' | 'algorithmic';

/**
 * Risk levels
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Health status
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'depegged';

/**
 * Stablecoin metadata
 */
export interface StablecoinMetadata {
  symbol: string;
  name: string;
  type: StablecoinType;
  pegCurrency: string;
  targetPrice: number;
  addresses: Partial<Record<ChainId, string>>;
  decimals: number;
  website?: string;
  coingeckoId?: string;
  /** Stablecoin is deprecated / being wound down */
  deprecated?: boolean;
}

/**
 * Price data from a single source
 */
export interface PriceData {
  price: number;
  source: string;
  timestamp: number;
  liquidity?: number;
  volume24h?: number;
}

/**
 * Aggregated price information
 */
export interface AggregatedPrice {
  price: number;
  deviation: number;
  sources: PriceData[];
  timestamp: number;
  weightedAverage: number;
}

/**
 * Liquidity information
 */
export interface LiquidityInfo {
  totalLiquidity: number;
  liquidityByDex: Record<string, number>;
  depth: {
    buy: number;
    sell: number;
  };
  slippage: {
    onePercent: number;
    fivePercent: number;
  };
}

/**
 * Risk metrics
 */
export interface RiskMetrics {
  priceDeviation: number;
  liquidityScore: number;
  volatilityScore: number;
  volumeScore: number;
  collateralScore?: number;
}

/**
 * Health report for a stablecoin
 */
export interface HealthReport {
  symbol: string;
  chain: ChainId;
  timestamp: number;
  price: number;
  deviation: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: HealthStatus;
  metrics: RiskMetrics;
  liquidity: LiquidityInfo;
  alerts: string[];
}

/**
 * Configuration for the SDK
 */
export interface StableSentinelConfig {
  rpcUrls: Partial<Record<ChainId, string>>;
  apiKeys?: {
    coingecko?: string;
    coinmarketcap?: string;
    /** Set to true if using a paid CoinGecko Pro API key */
    coingeckoIsPro?: boolean;
  };
  cache?: {
    enabled?: boolean;
    ttl?: number;
  };
  thresholds?: {
    depegWarning?: number;
    depegCritical?: number;
    riskHigh?: number;
    riskMedium?: number;
  };
}

/**
 * Price provider interface
 */
export interface IPriceProvider {
  name: string;
  getPrices(symbols: string[], chain: ChainId): Promise<PriceData[]>;
  isAvailable(): Promise<boolean>;
}

/**
 * Liquidity provider interface
 */
export interface ILiquidityProvider {
  name: string;
  getLiquidity(symbol: string, chain: ChainId): Promise<LiquidityInfo>;
  isAvailable(): Promise<boolean>;
}

/**
 * Event types
 */
export interface DepegEvent {
  symbol: string;
  chain: ChainId;
  price: number;
  deviation: number;
  timestamp: number;
  severity: 'warning' | 'critical';
}

export interface RiskChangeEvent {
  symbol: string;
  chain: ChainId;
  oldRiskScore: number;
  newRiskScore: number;
  timestamp: number;
}


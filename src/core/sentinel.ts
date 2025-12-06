import { EventEmitter } from 'events';
import {
  StableSentinelConfig,
  ChainId,
  HealthReport,
  DepegEvent,
  RiskChangeEvent,
  LiquidityInfo,
} from '../types';
import { ConfigManager, getConfig } from '../config';
import { CacheManager, getCache } from '../utils/cache';
import { RiskCalculator } from './risk-calculator';
import { FallbackPriceProvider } from '../providers/price';
import { getStablecoin, isSupported, getAllStablecoins } from '../data/stablecoins';
import { getCurrentTimestamp } from '../utils/math';
import { logger } from '../utils/logger';
import { UnsupportedStablecoinError, PriceDataError } from '../utils/errors';

/**
 * Main StableSentinel class for monitoring stablecoin health
 */
export class StableSentinel extends EventEmitter {
  private config: ConfigManager;
  private cache: CacheManager;
  private riskCalculator: RiskCalculator;
  private priceProvider: FallbackPriceProvider;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(userConfig?: Partial<StableSentinelConfig>) {
    super();
    this.config = getConfig(userConfig);
    
    const cacheSettings = this.config.getCacheSettings();
    this.cache = getCache(cacheSettings.ttl, cacheSettings.enabled);
    
    const thresholds = this.config.getThresholds();
    this.riskCalculator = new RiskCalculator(thresholds);
    
    const apiKey = this.config.getApiKey('coingecko');
    const rpcUrls = this.config.getConfig().rpcUrls;
    this.priceProvider = new FallbackPriceProvider(apiKey, rpcUrls);
  }

  /**
   * Get health report for a stablecoin
   */
  async getHealth(symbol: string, chain: ChainId = 'ethereum'): Promise<HealthReport> {
    if (!isSupported(symbol)) {
      throw new UnsupportedStablecoinError(symbol);
    }

    const stablecoin = getStablecoin(symbol)!;

    // Check cache first
    const cacheKey = CacheManager.generateKey('health', symbol, chain);
    const cached = this.cache.get<HealthReport>(cacheKey);
    if (cached) {
      logger.debug(`Cache hit for ${symbol} on ${chain}`);
      return cached;
    }

    try {
      logger.debug(`Fetching health data for ${symbol} on ${chain}`);

      // Fetch prices from multiple sources
      const priceData = await this.priceProvider.getPrices([symbol], chain);

      if (priceData.length === 0) {
        throw new PriceDataError(`No price data available for ${symbol}`);
      }

      // Aggregate prices
      const aggregatedPrice = this.riskCalculator.aggregatePrices(
        priceData,
        stablecoin.targetPrice
      );

      // Get liquidity info (placeholder for now)
      const liquidity = await this.getLiquidityInfo(symbol, chain);

      // Calculate risk metrics
      const metrics = this.riskCalculator.calculateRiskMetrics(
        aggregatedPrice,
        liquidity,
        stablecoin.type
      );

      // Calculate overall risk score
      const riskScore = this.riskCalculator.calculateRiskScore(metrics);

      // Determine risk level and health status
      const riskLevel = this.riskCalculator.getRiskLevel(riskScore);
      const status = this.riskCalculator.getHealthStatus(
        aggregatedPrice.deviation,
        riskScore
      );

      // Generate alerts
      const alerts = this.riskCalculator.generateAlerts(
        symbol,
        aggregatedPrice.deviation,
        riskScore,
        metrics
      );

      const report: HealthReport = {
        symbol,
        chain,
        timestamp: getCurrentTimestamp(),
        price: aggregatedPrice.price,
        deviation: aggregatedPrice.deviation,
        riskScore,
        riskLevel,
        status,
        metrics,
        liquidity,
        alerts,
      };

      // Cache the report
      this.cache.set(cacheKey, report, 60);
      logger.debug(`Health report generated for ${symbol}: risk=${riskScore}, status=${status}`);

      // Emit events if needed
      this.emitEvents(report);

      return report;
    } catch (error) {
      logger.error(`Failed to get health report for ${symbol}:`, error);
      
      if (error instanceof UnsupportedStablecoinError || error instanceof PriceDataError) {
        throw error;
      }
      
      throw new PriceDataError(
        `Failed to get health report for ${symbol}`,
        error as Error
      );
    }
  }

  /**
   * Get health reports for multiple stablecoins
   */
  async getMultipleHealth(
    symbols: string[],
    chain: ChainId = 'ethereum'
  ): Promise<HealthReport[]> {
    const reports = await Promise.allSettled(
      symbols.map((symbol) => this.getHealth(symbol, chain))
    );

    return reports
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<HealthReport>).value);
  }

  /**
   * Start monitoring a stablecoin
   */
  startMonitoring(symbol: string, chain: ChainId = 'ethereum', intervalMs: number = 60000): void {
    if (!isSupported(symbol)) {
      throw new UnsupportedStablecoinError(symbol);
    }

    const key = `${symbol}-${chain}`;
    
    // Stop existing monitoring if any
    this.stopMonitoring(symbol, chain);

    logger.info(`Starting monitoring for ${symbol} on ${chain} (interval: ${intervalMs}ms)`);

    // Start new monitoring
    const interval = setInterval(async () => {
      try {
        await this.getHealth(symbol, chain);
      } catch (error) {
        logger.error(`Monitoring error for ${symbol}:`, error);
      }
    }, intervalMs);

    this.monitoringIntervals.set(key, interval);
    
    // Do initial check
    this.getHealth(symbol, chain).catch((error) => {
      logger.error(`Initial health check failed for ${symbol}:`, error);
    });
  }

  /**
   * Stop monitoring a stablecoin
   */
  stopMonitoring(symbol: string, chain: ChainId = 'ethereum'): void {
    const key = `${symbol}-${chain}`;
    const interval = this.monitoringIntervals.get(key);
    
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(key);
    }
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring(): void {
    for (const interval of this.monitoringIntervals.values()) {
      clearInterval(interval);
    }
    this.monitoringIntervals.clear();
  }

  /**
   * Get list of all supported stablecoins
   */
  getSupportedStablecoins(): string[] {
    return getAllStablecoins();
  }

  /**
   * Check if price provider is available
   */
  async checkProviderAvailability(): Promise<boolean> {
    return this.priceProvider.isAvailable();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get liquidity information (placeholder)
   */
  private async getLiquidityInfo(symbol: string, chain: ChainId): Promise<LiquidityInfo> {
    // This would fetch real liquidity data from DEXs
    // For now, returning mock data
    return {
      totalLiquidity: 50_000_000, // $50M
      liquidityByDex: {
        Uniswap: 30_000_000,
        Curve: 20_000_000,
      },
      depth: {
        buy: 1_000_000,
        sell: 1_000_000,
      },
      slippage: {
        onePercent: 0.01,
        fivePercent: 0.05,
      },
    };
  }

  /**
   * Emit events based on health report
   */
  private emitEvents(report: HealthReport): void {
    // Emit depeg warning/critical events
    if (report.status === 'critical' || report.status === 'depegged') {
      const event: DepegEvent = {
        symbol: report.symbol,
        chain: report.chain,
        price: report.price,
        deviation: report.deviation,
        timestamp: report.timestamp,
        severity: report.status === 'depegged' ? 'critical' : 'warning',
      };
      this.emit('depeg-warning', event);
    }

    // Check for risk score changes
    const cacheKey = CacheManager.generateKey('risk-score', report.symbol, report.chain);
    const previousScore = this.cache.get<number>(cacheKey);
    
    if (previousScore !== undefined && Math.abs(previousScore - report.riskScore) >= 10) {
      const event: RiskChangeEvent = {
        symbol: report.symbol,
        chain: report.chain,
        oldRiskScore: previousScore,
        newRiskScore: report.riskScore,
        timestamp: report.timestamp,
      };
      this.emit('risk-change', event);
    }

    this.cache.set(cacheKey, report.riskScore, 3600);
  }
}


import {
  RiskMetrics,
  RiskLevel,
  HealthStatus,
  AggregatedPrice,
  LiquidityInfo,
  PriceData,
} from '../types';
import {
  calculateDeviation,
  calculateWeightedAverage,
  calculateStandardDeviation,
  removeOutliers,
  clamp,
} from '../utils/math';

/**
 * Risk calculator for stablecoins
 */
export class RiskCalculator {
  private thresholds: {
    depegWarning: number;
    depegCritical: number;
    riskHigh: number;
    riskMedium: number;
  };

  constructor(thresholds?: {
    depegWarning?: number;
    depegCritical?: number;
    riskHigh?: number;
    riskMedium?: number;
  }) {
    this.thresholds = {
      depegWarning: thresholds?.depegWarning || 0.5,
      depegCritical: thresholds?.depegCritical || 2.0,
      riskHigh: thresholds?.riskHigh || 70,
      riskMedium: thresholds?.riskMedium || 40,
    };
  }

  /**
   * Aggregate prices from multiple sources
   */
  aggregatePrices(priceData: PriceData[], targetPrice: number = 1.0): AggregatedPrice {
    if (priceData.length === 0) {
      return {
        price: targetPrice,
        deviation: 0,
        sources: [],
        timestamp: Date.now(),
        weightedAverage: targetPrice,
      };
    }

    // Remove outliers
    const prices = priceData.map((p) => p.price);
    const cleanPrices = removeOutliers(prices);

    // Calculate weighted average (simple equal weights for now)
    const validPrices = priceData.filter((p) => cleanPrices.includes(p.price));
    const weightedAvg = calculateWeightedAverage(
      validPrices.map((p) => ({ price: p.price, weight: 1 }))
    );

    // Calculate deviation from target
    const deviation = calculateDeviation(weightedAvg, targetPrice);

    return {
      price: weightedAvg,
      deviation,
      sources: priceData,
      timestamp: Date.now(),
      weightedAverage: weightedAvg,
    };
  }

  /**
   * Calculate risk metrics
   */
  calculateRiskMetrics(
    aggregatedPrice: AggregatedPrice,
    liquidity?: LiquidityInfo,
    stablecoinType?: string
  ): RiskMetrics {
    // Price deviation score (0-100, higher is worse)
    const priceDeviationScore = this.calculatePriceDeviationScore(
      aggregatedPrice.deviation
    );

    // Liquidity score (0-100, higher is better)
    const liquidityScore = this.calculateLiquidityScore(liquidity);

    // Volatility score (0-100, higher is worse)
    const volatilityScore = this.calculateVolatilityScore(aggregatedPrice.sources);

    // Volume score (0-100, higher is better)
    const volumeScore = this.calculateVolumeScore(aggregatedPrice.sources);

    // Collateral score (only for crypto-collateralized stablecoins)
    let collateralScore: number | undefined;
    if (stablecoinType === 'crypto-collateralized') {
      collateralScore = this.calculateCollateralScore();
    }

    return {
      priceDeviation: priceDeviationScore,
      liquidityScore,
      volatilityScore,
      volumeScore,
      collateralScore,
    };
  }

  /**
   * Calculate overall risk score (0-100, higher is worse)
   */
  calculateRiskScore(metrics: RiskMetrics): number {
    // Weighted combination of different metrics
    const weights = {
      priceDeviation: 0.4,
      liquidity: 0.25,
      volatility: 0.2,
      volume: 0.1,
      collateral: 0.05,
    };

    let score =
      metrics.priceDeviation * weights.priceDeviation +
      (100 - metrics.liquidityScore) * weights.liquidity +
      metrics.volatilityScore * weights.volatility +
      (100 - metrics.volumeScore) * weights.volume;

    if (metrics.collateralScore !== undefined) {
      score += (100 - metrics.collateralScore) * weights.collateral;
    }

    return clamp(Math.round(score), 0, 100);
  }

  /**
   * Determine risk level from score
   */
  getRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= this.thresholds.riskHigh) return 'critical';
    if (riskScore >= this.thresholds.riskMedium) return 'high';
    if (riskScore >= 20) return 'medium';
    return 'low';
  }

  /**
   * Determine health status
   */
  getHealthStatus(deviation: number, riskScore: number): HealthStatus {
    if (deviation >= this.thresholds.depegCritical || riskScore >= 90) {
      return 'depegged';
    }
    if (deviation >= this.thresholds.depegWarning || riskScore >= this.thresholds.riskHigh) {
      return 'critical';
    }
    if (riskScore >= this.thresholds.riskMedium) {
      return 'warning';
    }
    return 'healthy';
  }

  /**
   * Generate alerts based on metrics
   */
  generateAlerts(
    symbol: string,
    deviation: number,
    riskScore: number,
    metrics: RiskMetrics
  ): string[] {
    const alerts: string[] = [];

    if (deviation >= this.thresholds.depegCritical) {
      alerts.push(`🚨 CRITICAL: ${symbol} has depegged by ${deviation.toFixed(2)}%`);
    } else if (deviation >= this.thresholds.depegWarning) {
      alerts.push(`⚠️  WARNING: ${symbol} price deviation is ${deviation.toFixed(2)}%`);
    }

    if (metrics.priceDeviation > 70) {
      alerts.push('⚠️  High price deviation detected across sources');
    }

    if (metrics.liquidityScore < 30) {
      alerts.push('⚠️  Low liquidity detected');
    }

    if (metrics.volatilityScore > 70) {
      alerts.push('⚠️  High volatility in recent prices');
    }

    if (metrics.volumeScore < 30) {
      alerts.push('⚠️  Low trading volume detected');
    }

    if (metrics.collateralScore !== undefined && metrics.collateralScore < 50) {
      alerts.push('⚠️  Collateral ratio below safe threshold');
    }

    if (riskScore >= this.thresholds.riskHigh && alerts.length === 0) {
      alerts.push('⚠️  Overall risk score is elevated');
    }

    return alerts;
  }

  /**
   * Calculate price deviation score
   */
  private calculatePriceDeviationScore(deviation: number): number {
    // Map deviation percentage to 0-100 score
    // 0% deviation = 0 score (best)
    // 5% deviation = 100 score (worst)
    const maxDeviation = 5;
    return clamp((deviation / maxDeviation) * 100, 0, 100);
  }

  /**
   * Calculate liquidity score
   */
  private calculateLiquidityScore(liquidity?: LiquidityInfo): number {
    if (!liquidity) return 50; // Default neutral score

    // Higher liquidity = higher score (better)
    const totalLiquidity = liquidity.totalLiquidity;

    // Score based on liquidity tiers
    if (totalLiquidity >= 100_000_000) return 100; // $100M+
    if (totalLiquidity >= 50_000_000) return 90; // $50M+
    if (totalLiquidity >= 10_000_000) return 75; // $10M+
    if (totalLiquidity >= 5_000_000) return 60; // $5M+
    if (totalLiquidity >= 1_000_000) return 40; // $1M+
    return 20; // < $1M
  }

  /**
   * Calculate volatility score
   */
  private calculateVolatilityScore(sources: PriceData[]): number {
    if (sources.length < 2) return 0;

    const prices = sources.map((s) => s.price);
    const stdDev = calculateStandardDeviation(prices);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    // Coefficient of variation as percentage
    const cv = (stdDev / avgPrice) * 100;

    // Map CV to 0-100 score
    return clamp(cv * 50, 0, 100);
  }

  /**
   * Calculate volume score
   */
  private calculateVolumeScore(sources: PriceData[]): number {
    const volumeData = sources.filter((s) => s.volume24h !== undefined);
    if (volumeData.length === 0) return 50; // Default neutral

    const totalVolume = volumeData.reduce((sum, s) => sum + (s.volume24h || 0), 0);

    // Score based on volume tiers
    if (totalVolume >= 1_000_000_000) return 100; // $1B+
    if (totalVolume >= 500_000_000) return 90; // $500M+
    if (totalVolume >= 100_000_000) return 75; // $100M+
    if (totalVolume >= 50_000_000) return 60; // $50M+
    if (totalVolume >= 10_000_000) return 40; // $10M+
    return 20; // < $10M
  }

  /**
   * Calculate collateral score (placeholder for now)
   */
  private calculateCollateralScore(): number {
    // This would require on-chain data for protocols like MakerDAO
    // Placeholder returning neutral score
    return 75;
  }
}


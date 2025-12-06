/**
 * Example: DeFi Risk Manager
 * 
 * Integration example for DeFi protocols to manage stablecoin risk.
 */

import { StableSentinel, HealthReport } from '../src';

class DeFiRiskManager {
  private sentinel: StableSentinel;
  private riskThreshold: number;

  constructor(riskThreshold: number = 60) {
    this.sentinel = new StableSentinel();
    this.riskThreshold = riskThreshold;
  }

  /**
   * Check if a stablecoin is safe to accept
   */
  async isSafeToAccept(symbol: string, chain: string = 'ethereum'): Promise<boolean> {
    const health = await this.sentinel.getHealth(symbol, chain as any);
    
    return (
      health.riskScore < this.riskThreshold &&
      health.status !== 'depegged' &&
      health.deviation < 1.0
    );
  }

  /**
   * Get recommended stablecoins sorted by safety
   */
  async getRecommendedStablecoins(chain: string = 'ethereum'): Promise<HealthReport[]> {
    const stablecoins = this.sentinel.getSupportedStablecoins();
    const reports = await this.sentinel.getMultipleHealth(stablecoins, chain as any);
    
    return reports
      .filter(r => r.riskScore < this.riskThreshold)
      .sort((a, b) => a.riskScore - b.riskScore);
  }

  /**
   * Calculate optimal diversification weights based on risk
   */
  async getDiversificationWeights(
    stablecoins: string[],
    chain: string = 'ethereum'
  ): Promise<Record<string, number>> {
    const reports = await this.sentinel.getMultipleHealth(stablecoins, chain as any);
    
    // Filter out high-risk stablecoins
    const safeCoins = reports.filter(r => r.riskScore < this.riskThreshold);
    
    if (safeCoins.length === 0) {
      throw new Error('No safe stablecoins found');
    }

    // Calculate weights (lower risk = higher weight)
    const weights: Record<string, number> = {};
    const inverseRisks = safeCoins.map(r => 100 - r.riskScore);
    const totalInverseRisk = inverseRisks.reduce((sum, r) => sum + r, 0);
    
    safeCoins.forEach((report, i) => {
      weights[report.symbol] = inverseRisks[i] / totalInverseRisk;
    });
    
    return weights;
  }

  /**
   * Assess treasury health
   */
  async assessTreasury(
    holdings: Record<string, number>,
    chain: string = 'ethereum'
  ): Promise<{
    totalValue: number;
    weightedRisk: number;
    recommendations: string[];
  }> {
    const symbols = Object.keys(holdings);
    const reports = await this.sentinel.getMultipleHealth(symbols, chain as any);
    
    let totalValue = 0;
    let weightedRisk = 0;
    const recommendations: string[] = [];

    for (const report of reports) {
      const amount = holdings[report.symbol];
      const value = amount * report.price;
      totalValue += value;
      weightedRisk += (report.riskScore * value);

      if (report.riskScore > this.riskThreshold) {
        recommendations.push(
          `⚠️  Reduce ${report.symbol} exposure (Risk: ${report.riskScore}/100)`
        );
      }

      if (report.status === 'critical' || report.status === 'depegged') {
        recommendations.push(
          `🚨 URGENT: Exit ${report.symbol} position immediately!`
        );
      }
    }

    const avgRisk = totalValue > 0 ? weightedRisk / totalValue : 0;

    if (avgRisk > this.riskThreshold) {
      recommendations.push('📊 Overall treasury risk is high - diversify holdings');
    }

    return {
      totalValue,
      weightedRisk: avgRisk,
      recommendations,
    };
  }
}

// Example usage
async function main() {
  console.log('=== DeFi Risk Manager Example ===\n');

  const riskManager = new DeFiRiskManager(60);

  // Example 1: Check if we should accept a deposit
  console.log('1. Checking if USDT is safe to accept...');
  const canAcceptUSDT = await riskManager.isSafeToAccept('USDT', 'ethereum');
  console.log(`   Result: ${canAcceptUSDT ? '✅ ACCEPT' : '❌ REJECT'}\n`);

  // Example 2: Get recommended stablecoins
  console.log('2. Getting recommended stablecoins...');
  const recommended = await riskManager.getRecommendedStablecoins('ethereum');
  console.log('   Safest stablecoins:');
  recommended.slice(0, 5).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.symbol} (Risk: ${r.riskScore}/100)`);
  });
  console.log();

  // Example 3: Calculate diversification weights
  console.log('3. Calculating diversification weights...');
  const weights = await riskManager.getDiversificationWeights(
    ['USDT', 'USDC', 'DAI', 'FRAX'],
    'ethereum'
  );
  console.log('   Recommended allocation:');
  Object.entries(weights).forEach(([symbol, weight]) => {
    console.log(`   ${symbol}: ${(weight * 100).toFixed(1)}%`);
  });
  console.log();

  // Example 4: Assess treasury
  console.log('4. Assessing treasury health...');
  const treasury = {
    USDT: 100000,
    USDC: 50000,
    DAI: 30000,
  };
  
  const assessment = await riskManager.assessTreasury(treasury, 'ethereum');
  console.log(`   Total Value: $${assessment.totalValue.toLocaleString()}`);
  console.log(`   Weighted Risk: ${assessment.weightedRisk.toFixed(1)}/100`);
  
  if (assessment.recommendations.length > 0) {
    console.log('\n   Recommendations:');
    assessment.recommendations.forEach(rec => console.log(`   ${rec}`));
  } else {
    console.log('\n   ✅ Treasury health is good!');
  }
}

// Run the example
main().catch(console.error);


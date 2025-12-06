/**
 * Example: Portfolio Monitoring
 * 
 * Monitor multiple stablecoins in a portfolio and track their health.
 */

import { StableSentinel, HealthReport } from '../src';

async function monitorPortfolio() {
  console.log('=== Portfolio Monitoring Example ===\n');

  const sentinel = new StableSentinel();

  // Define portfolio
  const portfolio = {
    USDT: 10000,
    USDC: 5000,
    DAI: 3000,
    FRAX: 2000,
  };

  console.log('Portfolio:');
  Object.entries(portfolio).forEach(([symbol, amount]) => {
    console.log(`  ${symbol}: $${amount.toLocaleString()}`);
  });
  console.log();

  try {
    // Get health reports for all stablecoins
    const symbols = Object.keys(portfolio);
    const reports = await sentinel.getMultipleHealth(symbols, 'ethereum');

    // Calculate portfolio metrics
    let totalValue = 0;
    let weightedRisk = 0;
    const highRiskAssets: string[] = [];

    console.log('Health Status:');
    console.log('─'.repeat(80));

    reports.forEach(report => {
      const amount = portfolio[report.symbol as keyof typeof portfolio];
      const value = amount * report.price;
      totalValue += value;
      weightedRisk += (report.riskScore * value);

      // Display status
      const statusEmoji = report.status === 'healthy' ? '✅' : 
                         report.status === 'warning' ? '⚠️' : '🚨';
      
      console.log(`${statusEmoji} ${report.symbol}:`);
      console.log(`   Price: $${report.price.toFixed(4)} | Deviation: ${report.deviation.toFixed(2)}%`);
      console.log(`   Risk Score: ${report.riskScore}/100 (${report.riskLevel})`);
      console.log(`   Value: $${value.toLocaleString()}`);
      
      if (report.alerts.length > 0) {
        console.log(`   Alerts: ${report.alerts.length}`);
      }
      console.log();

      // Track high-risk assets
      if (report.riskScore > 60) {
        highRiskAssets.push(report.symbol);
      }
    });

    // Portfolio summary
    console.log('─'.repeat(80));
    console.log('\n📊 Portfolio Summary:');
    console.log(`Total Value: $${totalValue.toLocaleString()}`);
    console.log(`Weighted Risk Score: ${(weightedRisk / totalValue).toFixed(1)}/100`);

    // Recommendations
    if (highRiskAssets.length > 0) {
      console.log('\n⚠️  HIGH RISK DETECTED!');
      console.log(`Assets to review: ${highRiskAssets.join(', ')}`);
      console.log('Consider rebalancing your portfolio.');
    } else {
      console.log('\n✅ Portfolio health is good!');
    }

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

// Run the example
monitorPortfolio().catch(console.error);


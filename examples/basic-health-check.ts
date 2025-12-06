/**
 * Example: Basic Health Check
 * 
 * This example demonstrates how to perform a basic health check on a stablecoin.
 */

import { StableSentinel, HealthReport } from '../src';

async function basicHealthCheck() {
  console.log('=== Basic Health Check Example ===\n');

  // Create a new StableSentinel instance
  const sentinel = new StableSentinel();

  try {
    // Check USDT health on Ethereum
    console.log('Checking USDT health...');
    const health: HealthReport = await sentinel.getHealth('USDT', 'ethereum');

    // Display results
    console.log('\n📊 Health Report:');
    console.log(`Symbol: ${health.symbol}`);
    console.log(`Chain: ${health.chain}`);
    console.log(`Price: $${health.price.toFixed(4)}`);
    console.log(`Deviation: ${health.deviation.toFixed(2)}%`);
    console.log(`Risk Score: ${health.riskScore}/100`);
    console.log(`Risk Level: ${health.riskLevel}`);
    console.log(`Status: ${health.status}`);

    // Display metrics
    console.log('\n📈 Risk Metrics:');
    console.log(`  Price Deviation Score: ${health.metrics.priceDeviation.toFixed(1)}/100`);
    console.log(`  Liquidity Score: ${health.metrics.liquidityScore.toFixed(1)}/100`);
    console.log(`  Volatility Score: ${health.metrics.volatilityScore.toFixed(1)}/100`);
    console.log(`  Volume Score: ${health.metrics.volumeScore.toFixed(1)}/100`);

    // Display liquidity info
    console.log('\n💧 Liquidity:');
    console.log(`  Total: $${(health.liquidity.totalLiquidity / 1e6).toFixed(2)}M`);

    // Display alerts if any
    if (health.alerts.length > 0) {
      console.log('\n⚠️  Alerts:');
      health.alerts.forEach(alert => console.log(`  - ${alert}`));
    } else {
      console.log('\n✅ No alerts - All metrics healthy!');
    }

  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

// Run the example
basicHealthCheck().catch(console.error);


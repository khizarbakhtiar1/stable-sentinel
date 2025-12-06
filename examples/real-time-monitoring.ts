/**
 * Example: Real-time Monitoring with Alerts
 * 
 * Set up continuous monitoring and receive real-time alerts for depeg events.
 */

import { StableSentinel, DepegEvent, RiskChangeEvent } from '../src';

async function realTimeMonitoring() {
  console.log('=== Real-time Monitoring Example ===\n');

  const sentinel = new StableSentinel({
    thresholds: {
      depegWarning: 0.5,   // Alert if deviation > 0.5%
      depegCritical: 2.0,  // Critical alert if deviation > 2%
      riskHigh: 70,
      riskMedium: 40,
    },
  });

  // Set up event listeners
  sentinel.on('depeg-warning', (event: DepegEvent) => {
    console.log('\n🚨 DEPEG WARNING DETECTED!');
    console.log(`Symbol: ${event.symbol}`);
    console.log(`Chain: ${event.chain}`);
    console.log(`Price: $${event.price.toFixed(4)}`);
    console.log(`Deviation: ${event.deviation.toFixed(2)}%`);
    console.log(`Severity: ${event.severity}`);
    console.log(`Time: ${new Date(event.timestamp * 1000).toLocaleString()}`);
    
    // Here you would integrate with your notification system
    // sendSlackNotification(event);
    // sendDiscordNotification(event);
    // sendEmail(event);
  });

  sentinel.on('risk-change', (event: RiskChangeEvent) => {
    const change = event.newRiskScore - event.oldRiskScore;
    const changeDirection = change > 0 ? '📈' : '📉';
    
    console.log(`\n${changeDirection} Risk Score Change`);
    console.log(`Symbol: ${event.symbol}`);
    console.log(`Old Score: ${event.oldRiskScore}/100`);
    console.log(`New Score: ${event.newRiskScore}/100`);
    console.log(`Change: ${change > 0 ? '+' : ''}${change}`);
    
    if (change > 20) {
      console.log('⚠️  SIGNIFICANT RISK INCREASE!');
    }
  });

  // Start monitoring multiple stablecoins
  const stablecoins = ['USDT', 'USDC', 'DAI', 'FRAX'];
  
  console.log('Starting real-time monitoring for:');
  stablecoins.forEach(symbol => {
    console.log(`  - ${symbol}`);
    sentinel.startMonitoring(symbol, 'ethereum', 30000); // Check every 30 seconds
  });

  console.log('\n✅ Monitoring started!');
  console.log('Checking every 30 seconds...');
  console.log('Press Ctrl+C to stop.\n');

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n\nStopping monitoring...');
    sentinel.stopAllMonitoring();
    console.log('Monitoring stopped. Goodbye!');
    process.exit(0);
  });
}

// Run the example
realTimeMonitoring().catch(console.error);


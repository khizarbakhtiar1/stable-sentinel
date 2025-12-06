# 
 Quick Start Guide - StableSentinel

Get started with StableSentinel in 5 minutes!

## Prerequisites

- Node.js 16.x or higher
- npm or yarn

## Installation

### Option 1: Global Installation (CLI Usage)

```bash
npm install -g stablesentinel
```

### Option 2: Local Installation (Library Usage)

```bash
npm install stablesentinel
```

## Setup

1. **Create environment file (optional but recommended)**

Create a `.env` file in your project root:

```env
# RPC URLs (at least one recommended)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-rpc.com

# API Keys (optional - improves rate limits)
COINGECKO_API_KEY=your_key_here

# Cache settings
CACHE_TTL=60
```

2. **Test the installation**

```bash
stablesentinel list
```

You should see a list of supported stablecoins.

## Your First Health Check

### Using CLI

```bash
# Check USDT health
stablesentinel check USDT

# Check USDC on Polygon
stablesentinel check USDC --chain polygon

# Monitor multiple stablecoins
stablesentinel monitor USDT USDC DAI
```

### Using as a Library

Create a file `check-health.js`:

```javascript
const { StableSentinel } = require('stablesentinel');

async function checkHealth() {
  const sentinel = new StableSentinel();
  
  // Get health report
  const health = await sentinel.getHealth('USDT');
  
  console.log('Symbol:', health.symbol);
  console.log('Price:', health.price);
  console.log('Deviation:', health.deviation + '%');
  console.log('Risk Score:', health.riskScore + '/100');
  console.log('Status:', health.status);
  
  if (health.alerts.length > 0) {
    console.log('\nAlerts:');
    health.alerts.forEach(alert => console.log('  -', alert));
  }
}

checkHealth().catch(console.error);
```

Run it:

```bash
node check-health.js
```

### Using TypeScript

Create `check-health.ts`:

```typescript
import { StableSentinel, HealthReport } from 'stablesentinel';

async function checkHealth() {
  const sentinel = new StableSentinel();
  
  const health: HealthReport = await sentinel.getHealth('USDT');
  
  console.log(`${health.symbol} Health Report`);
  console.log(`Price: $${health.price.toFixed(4)}`);
  console.log(`Deviation: ${health.deviation.toFixed(2)}%`);
  console.log(`Risk Score: ${health.riskScore}/100`);
  console.log(`Status: ${health.status}`);
  
  // Type-safe access to metrics
  console.log('\nRisk Metrics:');
  console.log(`  Price Deviation: ${health.metrics.priceDeviation.toFixed(1)}`);
  console.log(`  Liquidity Score: ${health.metrics.liquidityScore.toFixed(1)}`);
  console.log(`  Volatility Score: ${health.metrics.volatilityScore.toFixed(1)}`);
}

checkHealth().catch(console.error);
```

## Common Use Cases

### 1. Monitor Your DeFi Portfolio

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel();

// Monitor stablecoins in your portfolio
const portfolio = ['USDT', 'USDC', 'DAI', 'FRAX'];

async function checkPortfolio() {
  const reports = await sentinel.getMultipleHealth(portfolio);
  
  reports.forEach(report => {
    console.log(`\n${report.symbol}:`);
    console.log(`  Status: ${report.status}`);
    console.log(`  Risk: ${report.riskScore}/100`);
    
    if (report.riskScore > 60) {
      console.log('  

  HIGH RISK - Consider rebalancing!');
    }
  });
}

checkPortfolio();
```

### 2. Real-Time Monitoring with Alerts

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel();

// Listen for depeg events
sentinel.on('depeg-warning', (event) => {
  console.log(` ALERT: ${event.symbol} depegging!`);
  console.log(`Price: $${event.price}`);
  console.log(`Deviation: ${event.deviation}%`);
  
  // Take action: send notification, rebalance, etc.
  sendNotification(event);
});

// Start monitoring
sentinel.startMonitoring('USDT', 'ethereum', 30000); // Check every 30s
sentinel.startMonitoring('USDC', 'ethereum', 30000);
sentinel.startMonitoring('DAI', 'ethereum', 30000);

console.log('Monitoring started. Press Ctrl+C to stop.');
```

### 3. DeFi Protocol Risk Management

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel();
const RISK_THRESHOLD = 60;

async function shouldAcceptStablecoin(symbol: string): Promise<boolean> {
  const health = await sentinel.getHealth(symbol);
  
  return (
    health.riskScore < RISK_THRESHOLD &&
    health.status !== 'depegged' &&
    health.deviation < 1.0
  );
}

// Use in your protocol
async function processDeposit(stablecoin: string, amount: number) {
  const safe = await shouldAcceptStablecoin(stablecoin);
  
  if (!safe) {
    throw new Error(`${stablecoin} risk too high - deposit rejected`);
  }
  
  // Process deposit...
  console.log(`Accepted ${amount} ${stablecoin}`);
}

processDeposit('USDT', 1000);
```

### 4. Watch Mode (Real-time Terminal Updates)

```bash
# Watch USDT with 30-second updates
stablesentinel watch USDT --interval 30

# Watch on specific chain
stablesentinel watch USDC --chain polygon --interval 60
```

## Understanding the Output

### Risk Score (0-100)
- **0-20**: Low risk (Healthy)
- **20-40**: Medium risk (Monitor)
- **40-70**: High risk (Caution)
- **70-100**: Critical risk (Action needed)

### Health Status
- **healthy**: All metrics normal
- **warning**: Some concerning metrics
- **critical**: Significant risk detected
- **depegged**: Price significantly off peg

### Deviation
Percentage difference from the $1.00 peg:
- **< 0.5%**: Normal volatility
- **0.5% - 2%**: Warning level
- **> 2%**: Critical depeg

## Next Steps

1. **Explore CLI commands**: Run `stablesentinel --help`
2. **Read examples**: Check [EXAMPLES.md](./EXAMPLES.md) for advanced usage
3. **API reference**: See [README.md](./README.md) for complete API docs
4. **Configure thresholds**: Customize risk thresholds in `.env`

## Troubleshooting

### "No RPC URLs configured"
- Add at least one RPC URL to your `.env` file
- Or pass RPC URLs in configuration

### Rate limiting
- Get free API keys from CoinGecko
- Add them to your `.env` file
- Consider premium APIs for production

### Permission errors
- On Linux/Mac, you may need `sudo` for global install
- Or use `npm install stablesentinel` locally

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/stablesentinel/issues)
- **Documentation**: Full docs in README.md
- **Examples**: See EXAMPLES.md for more use cases

## What's Next?

Now that you've got the basics, try:
- Setting up automated monitoring for your portfolio
- Integrating into your DeFi protocol
- Building custom alert systems
- Contributing to the project!

Happy monitoring! 


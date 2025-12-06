# StableSentinel Examples

This document provides comprehensive examples of how to use the StableSentinel SDK.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [CLI Examples](#cli-examples)
4. [Library Usage](#library-usage)
5. [Event Handling](#event-handling)
6. [Advanced Usage](#advanced-usage)

## Installation

```bash
# Global installation for CLI
npm install -g stablesentinel

# Or local installation for library usage
npm install stablesentinel
```

## Basic Usage

### Simple Health Check

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel();

// Check USDT health
const health = await sentinel.getHealth('USDT');

console.log(`Price: $${health.price}`);
console.log(`Risk Score: ${health.riskScore}/100`);
console.log(`Status: ${health.status}`);
```

### Multiple Stablecoins

```typescript
const sentinel = new StableSentinel();

const reports = await sentinel.getMultipleHealth(['USDT', 'USDC', 'DAI']);

reports.forEach(report => {
  console.log(`${report.symbol}: ${report.status} (Risk: ${report.riskScore})`);
});
```

## CLI Examples

### Check Single Stablecoin

```bash
# Basic check
stablesentinel check USDT

# Check on specific chain
stablesentinel check USDC --chain polygon

# Short alias
ss check DAI
```

### Monitor Multiple Stablecoins

```bash
# Monitor default stablecoins (USDT, USDC, DAI)
stablesentinel monitor

# Monitor specific stablecoins
stablesentinel monitor USDT USDC BUSD FRAX

# Monitor on different chain
stablesentinel monitor USDT USDC --chain bsc
```

### Detailed Risk Analysis

```bash
# Get comprehensive risk report
stablesentinel risk USDT

# Risk report on specific chain
stablesentinel risk USDC --chain arbitrum
```

### List Supported Stablecoins

```bash
stablesentinel list
```

### Real-time Watching

```bash
# Watch with default 60s interval
stablesentinel watch USDT

# Custom interval (30 seconds)
stablesentinel watch USDC --interval 30

# Watch on specific chain
stablesentinel watch DAI --chain polygon --interval 45
```

## Library Usage

### Configuration

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel({
  rpcUrls: {
    ethereum: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
    polygon: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY',
  },
  apiKeys: {
    coingecko: 'YOUR_COINGECKO_API_KEY',
  },
  cache: {
    enabled: true,
    ttl: 60, // Cache for 60 seconds
  },
  thresholds: {
    depegWarning: 0.5,   // 0.5% deviation warning
    depegCritical: 2.0,  // 2.0% critical threshold
    riskHigh: 70,        // Risk score >= 70 is high
    riskMedium: 40,      // Risk score >= 40 is medium
  },
});
```

### Health Monitoring

```typescript
// Get health report
const health = await sentinel.getHealth('USDT', 'ethereum');

// Access various metrics
console.log('Price:', health.price);
console.log('Deviation:', health.deviation);
console.log('Risk Score:', health.riskScore);
console.log('Risk Level:', health.riskLevel);
console.log('Status:', health.status);

// Check metrics
console.log('Metrics:', health.metrics);
console.log('Liquidity:', health.liquidity);

// View alerts
health.alerts.forEach(alert => console.log(alert));
```

### Multi-Chain Monitoring

```typescript
const chains = ['ethereum', 'bsc', 'polygon'];
const symbol = 'USDT';

for (const chain of chains) {
  const health = await sentinel.getHealth(symbol, chain);
  console.log(`${symbol} on ${chain}: ${health.status}`);
}
```

## Event Handling

### Listen for Depeg Events

```typescript
const sentinel = new StableSentinel();

// Listen for depeg warnings
sentinel.on('depeg-warning', (event) => {
  console.log(`

  DEPEG WARNING: ${event.symbol}`);
  console.log(`Price: $${event.price}`);
  console.log(`Deviation: ${event.deviation}%`);
  console.log(`Severity: ${event.severity}`);
  
  // Send alert to your monitoring system
  sendAlert({
    type: 'depeg',
    symbol: event.symbol,
    severity: event.severity,
  });
});

// Start monitoring
sentinel.startMonitoring('USDT', 'ethereum', 30000); // Check every 30s
```

### Risk Score Changes

```typescript
sentinel.on('risk-change', (event) => {
  console.log(`Risk score changed for ${event.symbol}`);
  console.log(`Old: ${event.oldRiskScore}, New: ${event.newRiskScore}`);
  
  if (event.newRiskScore > event.oldRiskScore + 20) {
    console.log('

  Significant risk increase!');
  }
});
```

## Advanced Usage

### Custom Alert System

```typescript
import { StableSentinel, HealthReport } from 'stablesentinel';

class AlertManager {
  private sentinel: StableSentinel;
  
  constructor() {
    this.sentinel = new StableSentinel();
    this.setupAlerts();
  }
  
  private setupAlerts() {
    this.sentinel.on('depeg-warning', this.handleDepeg);
    this.sentinel.on('risk-change', this.handleRiskChange);
  }
  
  private handleDepeg = (event: any) => {
    // Send to Slack
    this.sendToSlack(` ${event.symbol} depeg warning!`);
    
    // Send to Discord
    this.sendToDiscord(event);
    
    // Log to database
    this.logToDatabase(event);
  }
  
  private handleRiskChange = (event: any) => {
    if (event.newRiskScore >= 70) {
      this.sendToSlack(`

  ${event.symbol} risk score: ${event.newRiskScore}`);
    }
  }
  
  async monitorPortfolio(stablecoins: string[]) {
    for (const coin of stablecoins) {
      this.sentinel.startMonitoring(coin, 'ethereum', 60000);
    }
  }
}

// Usage
const alertManager = new AlertManager();
await alertManager.monitorPortfolio(['USDT', 'USDC', 'DAI', 'FRAX']);
```

### DeFi Protocol Integration

```typescript
import { StableSentinel } from 'stablesentinel';

class StablecoinRiskManager {
  private sentinel: StableSentinel;
  private riskThreshold = 60;
  
  constructor() {
    this.sentinel = new StableSentinel();
  }
  
  /**
   * Check if a stablecoin is safe to accept
   */
  async isSafeToAccept(symbol: string, chain: string): Promise<boolean> {
    const health = await this.sentinel.getHealth(symbol, chain);
    
    return (
      health.riskScore < this.riskThreshold &&
      health.status !== 'depegged' &&
      health.deviation < 1.0
    );
  }
  
  /**
   * Get recommended stablecoins sorted by safety
   */
  async getRecommendedStablecoins(chain: string): Promise<string[]> {
    const stablecoins = this.sentinel.getSupportedStablecoins();
    const reports = await this.sentinel.getMultipleHealth(stablecoins, chain);
    
    return reports
      .filter(r => r.riskScore < this.riskThreshold)
      .sort((a, b) => a.riskScore - b.riskScore)
      .map(r => r.symbol);
  }
  
  /**
   * Get diversification weights based on risk
   */
  async getDiversificationWeights(
    stablecoins: string[],
    chain: string
  ): Promise<Record<string, number>> {
    const reports = await this.sentinel.getMultipleHealth(stablecoins, chain);
    
    // Lower risk = higher weight
    const weights: Record<string, number> = {};
    const inverseRisks = reports.map(r => 100 - r.riskScore);
    const totalInverseRisk = inverseRisks.reduce((sum, r) => sum + r, 0);
    
    reports.forEach((report, i) => {
      weights[report.symbol] = inverseRisks[i] / totalInverseRisk;
    });
    
    return weights;
  }
}

// Usage in a DeFi protocol
const riskManager = new StablecoinRiskManager();

// Before accepting a deposit
const canAcceptUSDT = await riskManager.isSafeToAccept('USDT', 'ethereum');
if (!canAcceptUSDT) {
  throw new Error('USDT risk too high');
}

// Get recommended stablecoins for treasury
const recommended = await riskManager.getRecommendedStablecoins('ethereum');
console.log('Safe stablecoins:', recommended);

// Get diversification strategy
const weights = await riskManager.getDiversificationWeights(
  ['USDT', 'USDC', 'DAI'],
  'ethereum'
);
console.log('Allocation:', weights);
```

### Continuous Monitoring Service

```typescript
import { StableSentinel, HealthReport } from 'stablesentinel';

class MonitoringService {
  private sentinel: StableSentinel;
  private watchlist: Map<string, HealthReport> = new Map();
  
  constructor() {
    this.sentinel = new StableSentinel();
  }
  
  async start(stablecoins: string[], intervalMs: number = 30000) {
    console.log('
 Starting monitoring service...');
    
    // Initial health check
    await this.checkAll(stablecoins);
    
    // Set up continuous monitoring
    setInterval(() => this.checkAll(stablecoins), intervalMs);
    
    console.log(`
 Monitoring ${stablecoins.length} stablecoins`);
  }
  
  private async checkAll(stablecoins: string[]) {
    const reports = await this.sentinel.getMultipleHealth(
      stablecoins,
      'ethereum'
    );
    
    for (const report of reports) {
      this.processReport(report);
    }
  }
  
  private processReport(report: HealthReport) {
    const previous = this.watchlist.get(report.symbol);
    this.watchlist.set(report.symbol, report);
    
    // Detect status changes
    if (previous && previous.status !== report.status) {
      this.notifyStatusChange(previous, report);
    }
    
    // Check critical conditions
    if (report.status === 'critical' || report.status === 'depegged') {
      this.notifyCritical(report);
    }
  }
  
  private notifyStatusChange(old: HealthReport, current: HealthReport) {
    console.log(`

 Status Change Detected
Symbol: ${current.symbol}
Old Status: ${old.status}
New Status: ${current.status}
Risk Score: ${current.riskScore}
    `);
  }
  
  private notifyCritical(report: HealthReport) {
    console.log(`
 CRITICAL ALERT
Symbol: ${report.symbol}
Status: ${report.status}
Price: $${report.price}
Deviation: ${report.deviation}%
Risk Score: ${report.riskScore}
    `);
  }
  
  getStatus(): Map<string, HealthReport> {
    return this.watchlist;
  }
}

// Usage
const service = new MonitoringService();
await service.start(['USDT', 'USDC', 'DAI', 'FRAX', 'LUSD'], 30000);
```

### Environment Variables

Create a `.env` file:

```env
# RPC URLs
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# API Keys
COINGECKO_API_KEY=your_key_here
COINMARKETCAP_API_KEY=your_key_here

# Cache Settings
CACHE_TTL=60

# Risk Thresholds
RISK_THRESHOLD_HIGH=70
RISK_THRESHOLD_MEDIUM=40
DEPEG_WARNING_THRESHOLD=0.5
DEPEG_CRITICAL_THRESHOLD=2.0
```

### TypeScript Types

```typescript
import { 
  StableSentinel,
  HealthReport,
  RiskLevel,
  HealthStatus,
  ChainId,
  DepegEvent,
  RiskChangeEvent
} from 'stablesentinel';

// Type-safe usage
const sentinel: StableSentinel = new StableSentinel();

const health: HealthReport = await sentinel.getHealth('USDT', 'ethereum');

const riskLevel: RiskLevel = health.riskLevel; // 'low' | 'medium' | 'high' | 'critical'
const status: HealthStatus = health.status;    // 'healthy' | 'warning' | 'critical' | 'depegged'
```

## Error Handling

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel();

try {
  const health = await sentinel.getHealth('USDT');
  console.log('Health:', health);
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Stablecoin not supported');
  } else if (error.message.includes('RPC')) {
    console.error('RPC connection failed');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Best Practices

1. **Cache Configuration**: Enable caching for production to reduce API calls
2. **Error Handling**: Always wrap calls in try-catch blocks
3. **Rate Limiting**: Be mindful of API rate limits when monitoring multiple assets
4. **Event Listeners**: Clean up event listeners when done
5. **RPC URLs**: Use premium RPC providers for better reliability
6. **Monitoring Intervals**: Don't set intervals too low (minimum 30 seconds recommended)

## Support

For issues and questions:
- GitHub Issues: [link]
- Documentation: [link]
- Discord: [link]


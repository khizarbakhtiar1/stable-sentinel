# 

 StableSentinel

**Real-time Stablecoin Health Monitoring & Risk Intelligence SDK**

StableSentinel is a comprehensive SDK and CLI tool for monitoring stablecoin health, detecting depeg risks, and providing real-time risk intelligence across multiple blockchain networks.

## 
 Features

- **Real-time Price Monitoring**: Aggregate prices from multiple sources (DEXs, oracles, CEXs)
- **Depeg Risk Scoring**: Advanced algorithm to calculate risk scores (0-100) for stablecoins
- **Multi-Chain Support**: Monitor stablecoins across Ethereum, BSC, Polygon, Arbitrum, and more
- **Liquidity Analysis**: Track liquidity depth and health across major DEXs
- **Historical Data**: Access historical price and risk data
- **CLI Interface**: Easy-to-use command-line interface for quick monitoring
- **Library/SDK**: Integrate into your own applications

## 
 Installation

```bash
npm install -g stablesentinel
```

Or for use as a library:

```bash
npm install stablesentinel
```

## 
 CLI Usage

```bash
# Check health of a specific stablecoin
stablesentinel check USDT

# Monitor multiple stablecoins
stablesentinel monitor USDT USDC DAI

# Get detailed risk report
stablesentinel risk USDT --chain ethereum

# List all supported stablecoins
stablesentinel list

# Watch mode (real-time updates)
stablesentinel watch USDT
```

## 
 Library Usage

```typescript
import { StableSentinel } from 'stablesentinel';

const sentinel = new StableSentinel({
  rpcUrls: {
    ethereum: 'YOUR_RPC_URL'
  }
});

// Get current health status
const health = await sentinel.getHealth('USDT', 'ethereum');
console.log(`Risk Score: ${health.riskScore}`);
console.log(`Price: $${health.price}`);
console.log(`Status: ${health.status}`);

// Monitor for depeg events
sentinel.on('depeg-warning', (data) => {
  console.log(`Warning: ${data.symbol} is depegging!`);
});
```

## 
 Configuration

Create a `.env` file in your project root:

```env
# RPC URLs (required)
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org
POLYGON_RPC_URL=https://polygon-rpc.com

# API Keys (optional but recommended)
COINGECKO_API_KEY=your_key_here
COINMARKETCAP_API_KEY=your_key_here

# Cache settings
CACHE_TTL=60
```

## 
 Supported Stablecoins

- **Fiat-backed**: USDT, USDC, BUSD, TUSD, USDP
- **Crypto-collateralized**: DAI, FRAX, sUSD, LUSD
- **Algorithmic**: USDD, USDN (monitoring only)

## 
 Supported Chains

- Ethereum
- Binance Smart Chain (BSC)
- Polygon
- Arbitrum
- Optimism
- Avalanche

## 

 Development

```bash
# Clone the repository
git clone https://github.com/yourusername/stablesentinel.git
cd stablesentinel

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev
```

## 
 Documentation

Full documentation available at: [docs link]

## 
 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 
 License

MIT License - see LICENSE file for details

## 

 Disclaimer

This tool is for informational purposes only. It does not constitute financial advice. Always do your own research before making investment decisions.

##  Links

- GitHub: [Repository link]
- Documentation: [Docs link]
- Issues: [Issues link]


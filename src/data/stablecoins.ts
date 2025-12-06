import { StablecoinMetadata } from '../types';

/**
 * Registry of supported stablecoins with their metadata
 */
export const STABLECOIN_REGISTRY: Record<string, StablecoinMetadata> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    type: 'fiat-backed',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 6,
    coingeckoId: 'tether',
    addresses: {
      ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      bsc: '0x55d398326f99059fF775485246999027B3197955',
      polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      optimism: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      avalanche: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    },
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'fiat-backed',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 6,
    coingeckoId: 'usd-coin',
    addresses: {
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    },
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    type: 'crypto-collateralized',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'dai',
    addresses: {
      ethereum: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      bsc: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
      polygon: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      arbitrum: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      optimism: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      avalanche: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    },
  },
  BUSD: {
    symbol: 'BUSD',
    name: 'Binance USD',
    type: 'fiat-backed',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'binance-usd',
    addresses: {
      ethereum: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
      bsc: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    },
  },
  FRAX: {
    symbol: 'FRAX',
    name: 'Frax',
    type: 'crypto-collateralized',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'frax',
    addresses: {
      ethereum: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
      bsc: '0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40',
      polygon: '0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89',
      arbitrum: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
      optimism: '0x2E3D870790dC77A83DD1d18184Acc7439A53f475',
      avalanche: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
    },
  },
  LUSD: {
    symbol: 'LUSD',
    name: 'Liquity USD',
    type: 'crypto-collateralized',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'liquity-usd',
    addresses: {
      ethereum: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
      arbitrum: '0x93b346b6BC2548dA6A1E7d98E9a421B42541425b',
      optimism: '0xc40F949F8a4e094D1b49a23ea9241D289B7b2819',
    },
  },
  TUSD: {
    symbol: 'TUSD',
    name: 'TrueUSD',
    type: 'fiat-backed',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'true-usd',
    addresses: {
      ethereum: '0x0000000000085d4780B73119b644AE5ecd22b376',
      bsc: '0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9',
      polygon: '0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756',
    },
  },
  USDP: {
    symbol: 'USDP',
    name: 'Pax Dollar',
    type: 'fiat-backed',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'paxos-standard',
    addresses: {
      ethereum: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
    },
  },
  USDD: {
    symbol: 'USDD',
    name: 'USDD',
    type: 'algorithmic',
    pegCurrency: 'USD',
    targetPrice: 1.0,
    decimals: 18,
    coingeckoId: 'usdd',
    addresses: {
      ethereum: '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
      bsc: '0xd17479997F34dd9156Deef8F95A52D81D265be9c',
    },
  },
};

/**
 * Get stablecoin metadata by symbol
 */
export function getStablecoin(symbol: string): StablecoinMetadata | undefined {
  return STABLECOIN_REGISTRY[symbol.toUpperCase()];
}

/**
 * Get all supported stablecoin symbols
 */
export function getAllStablecoins(): string[] {
  return Object.keys(STABLECOIN_REGISTRY);
}

/**
 * Check if a stablecoin is supported
 */
export function isSupported(symbol: string): boolean {
  return symbol.toUpperCase() in STABLECOIN_REGISTRY;
}

/**
 * Get stablecoins by type
 */
export function getStablecoinsByType(type: string): StablecoinMetadata[] {
  return Object.values(STABLECOIN_REGISTRY).filter((sc) => sc.type === type);
}

/**
 * Get stablecoin address for a specific chain
 */
export function getAddress(symbol: string, chain: string): string | undefined {
  const stablecoin = getStablecoin(symbol);
  if (!stablecoin) return undefined;
  return stablecoin.addresses[chain as keyof typeof stablecoin.addresses];
}


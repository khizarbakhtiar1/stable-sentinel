import axios, { AxiosError } from 'axios';
import { IPriceProvider, PriceData, ChainId } from '../types';
import { getStablecoin } from '../data/stablecoins';
import { retry } from '../utils/math';
import { getCache, CacheManager } from '../utils/cache';

/**
 * CoinGecko price provider
 */
export class CoinGeckoPriceProvider implements IPriceProvider {
  name = 'CoinGecko';
  private apiKey?: string;
  private isPro: boolean;
  private baseUrl: string;
  private cache: CacheManager;

  constructor(apiKey?: string, isPro: boolean = false) {
    this.apiKey = apiKey;
    this.isPro = isPro;
    this.baseUrl = isPro
      ? 'https://pro-api.coingecko.com/api/v3'
      : 'https://api.coingecko.com/api/v3';
    this.cache = getCache();
  }

  async getPrices(symbols: string[], _chain: ChainId): Promise<PriceData[]> {
    const results: PriceData[] = [];

    // Batch fetch prices for better performance
    const uncachedSymbols: string[] = [];
    const coingeckoIds: string[] = [];

    for (const symbol of symbols) {
      const cacheKey = CacheManager.generateKey('coingecko', symbol);
      const cached = this.cache.get<PriceData>(cacheKey);

      if (cached) {
        results.push(cached);
      } else {
        const metadata = getStablecoin(symbol);
        if (metadata?.coingeckoId) {
          uncachedSymbols.push(symbol);
          coingeckoIds.push(metadata.coingeckoId);
        }
      }
    }

    // Batch fetch all uncached prices in one API call
    if (coingeckoIds.length > 0) {
      try {
        const prices = await retry(() => this.fetchPrices(coingeckoIds));
        
        uncachedSymbols.forEach((symbol, index) => {
          const coingeckoId = coingeckoIds[index];
          const price = prices[coingeckoId];
          
          if (price !== undefined) {
            const priceData: PriceData = {
              price,
              source: this.name,
              timestamp: Date.now(),
            };

            this.cache.set(
              CacheManager.generateKey('coingecko', symbol),
              priceData,
              60
            );
            results.push(priceData);
          }
        });
      } catch (error) {
        const errorMessage = error instanceof AxiosError 
          ? `${error.message} (${error.response?.status})` 
          : String(error);
        console.error(`CoinGecko: Failed to fetch prices:`, errorMessage);
      }
    }

    return results;
  }

  private async fetchPrices(coingeckoIds: string[]): Promise<Record<string, number>> {
    const url = `${this.baseUrl}/simple/price`;
    const params: Record<string, string | boolean> = {
      ids: coingeckoIds.join(','),
      vs_currencies: 'usd',
      include_24hr_vol: true,
    };

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.apiKey) {
      // Use header-based auth (recommended by CoinGecko)
      // Pro API uses 'x-cg-pro-api-key', Demo/free uses 'x-cg-demo-api-key'
      const headerKey = this.isPro ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key';
      headers[headerKey] = this.apiKey;
    }

    const response = await axios.get(url, {
      params,
      timeout: 10000,
      headers,
    });

    const prices: Record<string, number> = {};
    for (const [id, data] of Object.entries(response.data)) {
      if (data && typeof data === 'object' && 'usd' in data) {
        prices[id] = (data as any).usd;
      }
    }

    return prices;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        const headerKey = this.isPro ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key';
        headers[headerKey] = this.apiKey;
      }
      await axios.get(`${this.baseUrl}/ping`, { 
        timeout: 5000,
        headers,
        validateStatus: (status) => status === 200,
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Chainlink price provider (on-chain oracle)
 */
export class ChainlinkPriceProvider implements IPriceProvider {
  name = 'Chainlink';
  private rpcUrls: Partial<Record<ChainId, string>>;
  private cache: CacheManager;

  // Chainlink price feed addresses for stablecoins (USD pairs)
  private priceFeedAddresses: Record<string, Partial<Record<ChainId, string>>> = {
    USDT: {
      ethereum: '0x3E7d1eAB13ad0104d22bbE6254F419e6c8F46B9e',
      bsc: '0xB97Ad0E74fa7d920791E90258A6E2085088b4320',
      polygon: '0x0A6513e40db6EB1b165753AD52E80663aeA50545',
      arbitrum: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7',
    },
    USDC: {
      ethereum: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      bsc: '0x51597f405303C4377E36123cBc172b13269EA163',
      polygon: '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
      arbitrum: '0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3',
    },
    DAI: {
      ethereum: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      polygon: '0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D',
      arbitrum: '0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB',
    },
  };

  constructor(rpcUrls: Partial<Record<ChainId, string>>) {
    this.rpcUrls = rpcUrls;
    this.cache = getCache();
  }

  async getPrices(_symbols: string[], _chain: ChainId): Promise<PriceData[]> {
    const results: PriceData[] = [];

    // Note: Chainlink implementation would require ethers.js contract calls
    // For now, returning empty array as this requires RPC setup
    // This is a placeholder for the actual implementation

    return results;
  }

  async isAvailable(): Promise<boolean> {
    return Object.keys(this.rpcUrls).length > 0;
  }
}

/**
 * DEX price provider (aggregates from multiple DEXs)
 */
export class DexPriceProvider implements IPriceProvider {
  name = 'DEX';
  private cache: CacheManager;

  constructor() {
    this.cache = getCache();
  }

  async getPrices(_symbols: string[], _chain: ChainId): Promise<PriceData[]> {
    const results: PriceData[] = [];

    // This would fetch prices from DEXs like Uniswap, Curve, PancakeSwap
    // Using The Graph or direct contract calls
    // Placeholder for actual implementation

    return results;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * Fallback price provider using multiple sources
 */
export class FallbackPriceProvider implements IPriceProvider {
  name = 'Fallback';
  private providers: IPriceProvider[];

  constructor(apiKey?: string, rpcUrls?: Partial<Record<ChainId, string>>, isPro: boolean = false) {
    this.providers = [
      new CoinGeckoPriceProvider(apiKey, isPro),
      new ChainlinkPriceProvider(rpcUrls || {}),
      new DexPriceProvider(),
    ];
  }

  async getPrices(symbols: string[], chain: ChainId): Promise<PriceData[]> {
    for (const provider of this.providers) {
      try {
        const available = await provider.isAvailable();
        if (!available) continue;

        const prices = await provider.getPrices(symbols, chain);
        if (prices.length > 0) {
          return prices;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`${provider.name} provider failed:`, errorMessage);
        continue;
      }
    }

    return [];
  }

  async isAvailable(): Promise<boolean> {
    try {
      const availability = await Promise.all(
        this.providers.map((p) => p.isAvailable())
      );
      return availability.some((a) => a);
    } catch {
      return false;
    }
  }
}

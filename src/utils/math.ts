/**
 * Calculate percentage deviation from target
 */
export function calculateDeviation(current: number, target: number): number {
  return Math.abs(((current - target) / target) * 100);
}

/**
 * Calculate weighted average of prices
 */
export function calculateWeightedAverage(
  prices: { price: number; weight: number }[]
): number {
  if (prices.length === 0) return 0;

  const totalWeight = prices.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return prices[0].price;

  const weightedSum = prices.reduce((sum, p) => sum + p.price * p.weight, 0);
  return weightedSum / totalWeight;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Remove outliers using IQR method
 */
export function removeOutliers(values: number[]): number[] {
  if (values.length < 4) return values;

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values.filter((val) => val >= lowerBound && val <= upperBound);
}

/**
 * Format number to fixed decimals
 */
export function formatNumber(num: number, decimals: number = 4): string {
  return num.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format currency (USD)
 */
export function formatCurrency(num: number, decimals: number = 4): string {
  return `$${formatNumber(num, decimals)}`;
}

/**
 * Format large numbers (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return formatCurrency(num, 2);
}

/**
 * Retry function with exponential backoff
 * Respects 429 rate limit responses by using longer delays
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error as Error;

      // If rate limited (429), use a longer backoff
      const isRateLimited =
        error?.response?.status === 429 || error?.status === 429;
      const backoff = isRateLimited
        ? Math.max(delay * Math.pow(2, i), 5000) // min 5s for rate limits
        : delay * Math.pow(2, i);

      if (i < maxRetries - 1) {
        await sleep(backoff);
      }
    }
  }

  throw lastError;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert timestamp to human-readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}


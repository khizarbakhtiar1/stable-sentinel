/**
 * Custom error classes for StableSentinel
 */

export class StableSentinelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StableSentinelError';
    Object.setPrototypeOf(this, StableSentinelError.prototype);
  }
}

export class UnsupportedStablecoinError extends StableSentinelError {
  constructor(symbol: string) {
    super(`Stablecoin ${symbol} is not supported`);
    this.name = 'UnsupportedStablecoinError';
    Object.setPrototypeOf(this, UnsupportedStablecoinError.prototype);
  }
}

export class PriceDataError extends StableSentinelError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'PriceDataError';
    Object.setPrototypeOf(this, PriceDataError.prototype);
  }
}

export class ConfigurationError extends StableSentinelError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class NetworkError extends StableSentinelError {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}


import {
  StableSentinelError,
  UnsupportedStablecoinError,
  PriceDataError,
  ConfigurationError,
  NetworkError,
} from '../utils/errors';

describe('Error Classes', () => {
  describe('StableSentinelError', () => {
    it('should set name and message', () => {
      const error = new StableSentinelError('test message');
      expect(error.name).toBe('StableSentinelError');
      expect(error.message).toBe('test message');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof StableSentinelError).toBe(true);
    });
  });

  describe('UnsupportedStablecoinError', () => {
    it('should include symbol in message', () => {
      const error = new UnsupportedStablecoinError('FAKECOIN');
      expect(error.name).toBe('UnsupportedStablecoinError');
      expect(error.message).toContain('FAKECOIN');
      expect(error instanceof StableSentinelError).toBe(true);
    });
  });

  describe('PriceDataError', () => {
    it('should set message and optional cause', () => {
      const cause = new Error('upstream');
      const error = new PriceDataError('price failed', cause);
      expect(error.name).toBe('PriceDataError');
      expect(error.message).toBe('price failed');
      expect(error.cause).toBe(cause);
      expect(error instanceof StableSentinelError).toBe(true);
    });

    it('should work without cause', () => {
      const error = new PriceDataError('price failed');
      expect(error.cause).toBeUndefined();
    });
  });

  describe('ConfigurationError', () => {
    it('should set name and message', () => {
      const error = new ConfigurationError('bad config');
      expect(error.name).toBe('ConfigurationError');
      expect(error.message).toBe('bad config');
      expect(error instanceof StableSentinelError).toBe(true);
    });
  });

  describe('NetworkError', () => {
    it('should set message and optional cause', () => {
      const cause = new Error('timeout');
      const error = new NetworkError('network down', cause);
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('network down');
      expect(error.cause).toBe(cause);
      expect(error instanceof StableSentinelError).toBe(true);
    });
  });
});

import { logger } from '../utils/logger';

describe('Logger', () => {
  let debugSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Enable logger for tests
    logger.setEnabled(true);
    logger.setLevel('debug');
    debugSpy = jest.spyOn(console, 'debug').mockImplementation();
    infoSpy = jest.spyOn(console, 'info').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    debugSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    // Re-disable for other tests
    logger.setEnabled(false);
  });

  it('should log debug messages when level is debug', () => {
    logger.debug('debug message');
    expect(debugSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG]'),
      'debug message'
    );
  });

  it('should log info messages', () => {
    logger.info('info message');
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'info message'
    );
  });

  it('should log warn messages', () => {
    logger.warn('warn message');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WARN]'),
      'warn message'
    );
  });

  it('should log error messages', () => {
    logger.error('error message');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR]'),
      'error message'
    );
  });

  it('should not log below the set level', () => {
    logger.setLevel('error');
    logger.debug('should not appear');
    logger.info('should not appear');
    logger.warn('should not appear');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should not log when disabled', () => {
    logger.setEnabled(false);
    logger.error('should not appear');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should pass additional args', () => {
    logger.info('message', { extra: 'data' });
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO]'),
      'message',
      { extra: 'data' }
    );
  });
});

import ConsoleLogger, { formatConsoleArguments } from '../../../src/core/ConsoleLogger';

describe('ConsoleLogger', () => {
  let logger: ConsoleLogger;

  beforeEach(() => {
    logger = new ConsoleLogger();
  });

  afterEach(() => {
    logger.disableInterception();
    vi.restoreAllMocks();
  });

  it('forwards calls and captures structured arguments', () => {
    const originalLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const callback = vi.fn();
    logger.setCallback(callback);
    logger.enableInterception();

    console.log('Session restored', { userId: 42, plan: 'pro' });

    expect(originalLog).toHaveBeenCalledWith('Session restored', { userId: 42, plan: 'pro' });
    expect(logger.getEntries()).toHaveLength(1);
    expect(logger.getEntries()[0]).toMatchObject({
      level: 'log',
      hasStructuredData: true,
    });
    expect(logger.getEntries()[0].message).toContain('Session restored');
    expect(logger.getEntries()[0].detail).toContain('"userId": 42');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('holds entries while paused and publishes them when resumed', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const callback = vi.fn();
    logger.setCallback(callback);
    logger.enableInterception();
    logger.onPausedChange(true);

    console.warn('Slow render');

    expect(logger.getEntries()).toEqual([]);
    expect(callback).not.toHaveBeenCalled();

    logger.onPausedChange(false);

    expect(logger.getEntries()).toHaveLength(1);
    expect(logger.getEntries()[0].message).toBe('Slow render');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('enforces maxEntries and clears captured messages', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const callback = vi.fn();
    logger.setCallback(callback);
    logger.enableInterception({ maxEntries: 2 });

    console.info('one');
    console.info('two');
    console.info('three');

    expect(logger.getEntries().map((entry) => entry.message)).toEqual(['three', 'two']);

    logger.clearEntries();

    expect(logger.getEntries()).toEqual([]);
    expect(callback).toHaveBeenLastCalledWith([]);
  });

  it('formats circular values without throwing', () => {
    const value: Record<string, unknown> = { name: 'root' };
    value.self = value;

    const formatted = formatConsoleArguments([value]);

    expect(formatted.message).toContain('[Circular]');
    expect(formatted.detail).toContain('"self": "[Circular]"');
  });
});

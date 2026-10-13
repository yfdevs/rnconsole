import XHRInterceptor from '../../src/core/XHRInterceptor';
import { startNetworkLogging, stopNetworkLogging } from '../../src';
import logger from '../../src/core/loggerSingleton';
import { LOGGER_MAX_REQUESTS, LOGGER_REFRESH_RATE } from '../../src/core/constants';
import type { Mock } from 'vite-plus/test';

vi.mock('../../src/core/XHRInterceptor', () => ({
  default: {
    isInterceptorEnabled: vi.fn(),
    setOpenCallback: vi.fn(),
    setRequestHeaderCallback: vi.fn(),
    setSendCallback: vi.fn(),
    setHeaderReceivedCallback: vi.fn(),
    setResponseCallback: vi.fn(),
    enableInterception: vi.fn(),
    disableInterception: vi.fn(),
  },
}));

describe('singleton logger', () => {
  afterEach(() => {
    logger.disableXHRInterception();
    vi.resetAllMocks();
  });
  it('should set options when starting the logger', () => {
    (XHRInterceptor.isInterceptorEnabled as Mock).mockReturnValueOnce(false);
    expect(logger.enabled).toBe(false);

    startNetworkLogging({
      maxRequests: 23,
      ignoredHosts: ['foo'],
      ignoredUrls: ['bar'],
      ignoredPatterns: [/baz/],
    });

    // @ts-ignore
    expect(logger.maxRequests).toBe(23);
    // @ts-ignore
    expect(logger.ignoredHosts).toEqual(new Set(['foo']));
    // @ts-ignore
    expect(logger.ignoredUrls).toEqual(new Set(['bar']));
    // @ts-ignore
    expect(logger.ignoredPatterns).toEqual([/baz/]);
    expect(XHRInterceptor.isInterceptorEnabled).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setOpenCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setRequestHeaderCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setHeaderReceivedCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setSendCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setResponseCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.enableInterception).toHaveBeenCalledTimes(1);
    expect(logger.enabled).toBe(true);
  });

  it('should not start twice the logger', () => {
    (XHRInterceptor.isInterceptorEnabled as Mock).mockReturnValueOnce(false);
    expect(logger.enabled).toBe(false);

    startNetworkLogging();

    expect(XHRInterceptor.isInterceptorEnabled).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setOpenCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setRequestHeaderCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setHeaderReceivedCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setSendCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setResponseCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.enableInterception).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.disableInterception).toHaveBeenCalledTimes(0);
    expect(logger.enabled).toBe(true);

    startNetworkLogging();

    expect(XHRInterceptor.isInterceptorEnabled).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setOpenCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setRequestHeaderCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setHeaderReceivedCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setSendCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.setResponseCallback).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.enableInterception).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.disableInterception).toHaveBeenCalledTimes(0);
    expect(logger.enabled).toBe(true);
  });

  it('should stop the logger', () => {
    (XHRInterceptor.isInterceptorEnabled as Mock).mockReturnValueOnce(false);
    expect(logger.enabled).toBe(false);

    startNetworkLogging();

    expect(XHRInterceptor.isInterceptorEnabled).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.enableInterception).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.disableInterception).toHaveBeenCalledTimes(0);

    stopNetworkLogging();

    expect(XHRInterceptor.isInterceptorEnabled).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.enableInterception).toHaveBeenCalledTimes(1);
    expect(XHRInterceptor.disableInterception).toHaveBeenCalledTimes(1);

    expect(XHRInterceptor.setOpenCallback).toHaveBeenCalledTimes(2);
    expect(XHRInterceptor.setRequestHeaderCallback).toHaveBeenCalledTimes(2);
    expect(XHRInterceptor.setHeaderReceivedCallback).toHaveBeenCalledTimes(2);
    expect(XHRInterceptor.setSendCallback).toHaveBeenCalledTimes(2);
    expect(XHRInterceptor.setResponseCallback).toHaveBeenCalledTimes(2);

    expect(logger.enabled).toBe(false);
    expect(logger.isPaused).toBe(false);
    // @ts-ignore
    expect(logger.requests).toEqual([]);
    // @ts-ignore
    expect(logger.xhrIdMap).toEqual(new Map());
    // @ts-ignore
    expect(logger.maxRequests).toBe(LOGGER_MAX_REQUESTS);
    // @ts-ignore
    expect(logger.ignoredHosts).toBeUndefined();
    // @ts-ignore
    expect(logger.ignoredUrls).toBeUndefined();
    // @ts-ignore
    expect(logger.ignoredPatterns).toBeUndefined();
  });
});

describe('clearRequests', () => {
  it('should clear the requests', () => {
    vi.useFakeTimers();
    logger.callback = vi.fn();

    // @ts-ignore
    logger.requests = ['test-request'];

    logger.clearRequests();
    vi.advanceTimersByTime(LOGGER_REFRESH_RATE);

    expect(logger.getRequests()).toEqual([]);
    expect(logger.callback).toHaveBeenCalledTimes(1);
    expect(logger.callback).toHaveBeenCalledWith([]);
    vi.useFakeTimers();
  });
});

describe('getRequests', () => {
  it('should return the requests', () => {
    // @ts-ignore
    logger.requests = ['test-request'];

    expect(logger.getRequests()).toEqual(['test-request']);
  });
});

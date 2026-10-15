import FetchInterceptor from '../../../src/core/FetchInterceptor';

describe('FetchInterceptor', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    FetchInterceptor.disableInterception();
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('captures fetch request metadata, payload, headers, and response without consuming it', async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'content-type': 'application/json', 'content-length': '11' },
    });
    globalThis.fetch = vi.fn().mockResolvedValue(response);

    const requestToken = { id: 1 };
    const requestCallback = vi.fn(() => requestToken);
    const headerCallback = vi.fn();
    const responseCallback = vi.fn();
    FetchInterceptor.setRequestCallback(requestCallback);
    FetchInterceptor.setHeaderReceivedCallback(headerCallback);
    FetchInterceptor.setResponseCallback(responseCallback);
    FetchInterceptor.enableInterception();

    const result = await fetch('https://example.com/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'console' }),
    });
    await vi.waitFor(() => expect(responseCallback).toHaveBeenCalledTimes(1));

    expect(await result.json()).toEqual({ ok: true });
    expect(requestCallback).toHaveBeenCalledWith(
      'POST',
      'https://example.com/items',
      { 'content-type': 'application/json' },
      '{"name":"console"}',
      'text'
    );
    expect(headerCallback).toHaveBeenCalledWith(
      'application/json',
      11,
      expect.objectContaining({ 'content-type': 'application/json' }),
      requestToken
    );
    expect(responseCallback).toHaveBeenCalledWith(
      201,
      '{"ok":true}',
      'https://example.com/items',
      'json',
      requestToken
    );
  });

  it('restores the original fetch implementation when disabled', () => {
    const fetchImplementation = vi.fn();
    globalThis.fetch = fetchImplementation;

    FetchInterceptor.enableInterception();
    expect(globalThis.fetch).not.toBe(fetchImplementation);

    FetchInterceptor.disableInterception();
    expect(globalThis.fetch).toBe(fetchImplementation);
  });
});

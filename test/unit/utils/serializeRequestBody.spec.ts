import serializeRequestBody, { getRequestBodyType } from '../../../src/utils/serializeRequestBody';

describe('serializeRequestBody', () => {
  it('serializes object payloads instead of showing [object Object]', () => {
    expect(serializeRequestBody({ name: 'rnconsole', enabled: true })).toBe(
      '{"name":"rnconsole","enabled":true}'
    );
  });

  it('serializes React Native FormData parts and preserves duplicate fields', () => {
    expect(
      serializeRequestBody({
        _parts: [
          ['tag', 'one'],
          ['tag', 'two'],
          ['file', { constructor: { name: 'Blob' }, type: 'text/plain', size: 12 }],
        ],
      })
    ).toBe('{"tag":["one","two"],"file":"[Blob (text/plain), 12 bytes]"}');
  });
});

describe('getRequestBodyType', () => {
  it('distinguishes form data, URL-encoded data, JSON, and binary bodies', () => {
    expect(getRequestBodyType({ _parts: [['name', 'rnconsole']] })).toBe('form-data');
    expect(getRequestBodyType(new URLSearchParams({ query: 'network' }))).toBe('urlencoded');
    expect(getRequestBodyType({ enabled: true })).toBe('json');
    expect(getRequestBodyType(new ArrayBuffer(4))).toBe('binary');
  });
});

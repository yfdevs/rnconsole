import serializeRequestBody from '../utils/serializeRequestBody';
import type { Headers } from './types';

type RequestCallback = (method: string, url: string, headers: Headers, body: string) => unknown;
type RequestBodyCallback = (body: string, request: unknown) => void;
type HeaderReceivedCallback = (
  contentType: string,
  responseSize: number,
  responseHeaders: Headers,
  request: unknown
) => void;
type ResponseCallback = (
  status: number,
  response: string,
  responseURL: string,
  responseType: string,
  request: unknown
) => void;

let originalFetch: typeof globalThis.fetch | undefined;
let requestCallback: RequestCallback = () => undefined;
let requestBodyCallback: RequestBodyCallback = () => {};
let headerReceivedCallback: HeaderReceivedCallback = () => {};
let responseCallback: ResponseCallback = () => {};
let enabled = false;

function headersToObject(...sources: any[]): Headers {
  const result: Headers = {};
  for (const source of sources) {
    if (!source) continue;
    if (typeof source.forEach === 'function') {
      source.forEach((value: any, key: any) => {
        result[String(key)] = String(value);
      });
    } else if (Array.isArray(source)) {
      for (const [key, value] of source) result[String(key)] = String(value);
    } else {
      for (const [key, value] of Object.entries(source)) result[key] = String(value);
    }
  }
  return result;
}

function enableInterception(): void {
  if (enabled || typeof globalThis.fetch !== 'function') return;

  originalFetch = globalThis.fetch;
  globalThis.fetch = function interceptedFetch(
    this: typeof globalThis,
    input: any,
    init?: any
  ): Promise<any> {
    const url = typeof input === 'string' ? input : (input?.url ?? String(input));
    const method = String(init?.method ?? input?.method ?? 'GET').toUpperCase();
    const headers = headersToObject(input?.headers, init?.headers);
    const hasInitBody = Object.prototype.hasOwnProperty.call(init ?? {}, 'body');
    const body = hasInitBody ? serializeRequestBody(init.body) : '';

    let request: unknown;
    try {
      request = requestCallback(method, url, headers, body);
    } catch {
      // Logging must never break the application request.
    }

    if (!hasInitBody && input && typeof input.clone === 'function') {
      try {
        void input
          .clone()
          .text()
          .then((text: string) => requestBodyCallback(text, request))
          .catch(() => {});
      } catch {
        // Some React Native Request implementations cannot be cloned.
      }
    }

    let fetchResult: Promise<any>;
    try {
      fetchResult = Promise.resolve(originalFetch!.call(this, input, init));
    } catch (error) {
      try {
        responseCallback(0, String(error), url, 'text', request);
      } catch {}
      throw error;
    }

    return fetchResult.then(
      (response: any) => {
        const responseHeaders = headersToObject(response?.headers);
        const contentType =
          responseHeaders['content-type'] ?? responseHeaders['Content-Type'] ?? '';
        const lengthHeader =
          responseHeaders['content-length'] ?? responseHeaders['Content-Length'] ?? '';
        const responseSize = Number.parseInt(lengthHeader, 10) || 0;

        try {
          headerReceivedCallback(contentType, responseSize, responseHeaders, request);
        } catch {}

        try {
          const clonedResponse = response.clone();
          void clonedResponse
            .text()
            .then((text: string) => {
              responseCallback(
                response.status,
                text,
                response.url || url,
                contentType.includes('json') ? 'json' : 'text',
                request
              );
            })
            .catch(() => {
              responseCallback(response.status, '', response.url || url, 'text', request);
            });
        } catch {
          responseCallback(response.status, '', response.url || url, 'text', request);
        }

        return response;
      },
      (error: unknown) => {
        try {
          responseCallback(0, String(error), url, 'text', request);
        } catch {}
        throw error;
      }
    );
  } as typeof globalThis.fetch;

  enabled = true;
}

function disableInterception(): void {
  if (!enabled) return;
  if (originalFetch) globalThis.fetch = originalFetch;
  originalFetch = undefined;
  requestCallback = () => undefined;
  requestBodyCallback = () => {};
  headerReceivedCallback = () => {};
  responseCallback = () => {};
  enabled = false;
}

const FetchInterceptor = {
  isInterceptorEnabled: () => enabled,
  setRequestCallback: (callback: RequestCallback) => {
    requestCallback = callback;
  },
  setRequestBodyCallback: (callback: RequestBodyCallback) => {
    requestBodyCallback = callback;
  },
  setHeaderReceivedCallback: (callback: HeaderReceivedCallback) => {
    headerReceivedCallback = callback;
  },
  setResponseCallback: (callback: ResponseCallback) => {
    responseCallback = callback;
  },
  enableInterception,
  disableInterception,
};

export default FetchInterceptor;

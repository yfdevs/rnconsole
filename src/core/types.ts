import NetworkRequestInfo from './NetworkRequestInfo';

export type Headers = { [header: string]: string };

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export type StartNetworkLoggingOptions = {
  /**
   * Max number of requests to keep before overwriting
   * @default 500
   */
  maxRequests?: number;
  /** List of hosts to ignore, e.g. `services.test.com` */
  ignoredHosts?: string[];
  /** List of urls to ignore, e.g. `https://services.test.com/test` */
  ignoredUrls?: string[];
  /**
   * List of url patterns to ignore, e.g. `/^GET https://test.com\/pages\/.*$/`
   *
   * Url to match with is in the format: `${method} ${url}`, e.g. `GET https://test.com/pages/123`
   */
  ignoredPatterns?: RegExp[];
  /**
   * Force the network logger to start even if another program is using the network interceptor
   * e.g. a dev/debuging program
   */
  forceEnable?: boolean;
  /**
   * Refresh rate of the logger in milliseconds
   * @default 50
   */
  refreshRate?: number;
};

export type ConsoleLogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export type ConsoleLogEntry = {
  id: string;
  level: ConsoleLogLevel;
  timestamp: number;
  /** Compact single-line representation used by the list and search. */
  message: string;
  /** Pretty-printed representation of structured arguments. */
  detail: string;
  hasStructuredData: boolean;
};

export type StartConsoleLoggingOptions = {
  /**
   * Max number of console entries to keep before overwriting
   * @default 500
   */
  maxEntries?: number;
};

export type NetworkRequestInfoRow = Pick<
  NetworkRequestInfo,
  'url' | 'gqlOperation' | 'id' | 'method' | 'status' | 'duration' | 'startTime'
>;

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

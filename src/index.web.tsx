import type { StartConsoleLoggingOptions, StartNetworkLoggingOptions } from './core/types';

export const startNetworkLogging = (options?: StartNetworkLoggingOptions) => {
  void options;
  console.warn('startNetworkLogging is not implemented on this platform');
};

export const getRequests = () => [];

export const clearRequests = () => {};

export const stopNetworkLogging = () => {};

export const startConsoleLogging = (options?: StartConsoleLoggingOptions) => {
  void options;
  console.warn('startConsoleLogging is not implemented on this platform');
};

export const stopConsoleLogging = () => {};

export const getConsoleLogs = () => [];

export const clearConsoleLogs = () => {};

export { getBackHandler } from './core/backHandler';

export type { ThemeName, Theme } from './ui/theme';
export type { ConsoleLogEntry, ConsoleLogLevel, StartConsoleLoggingOptions } from './core/types';

export default () => null;

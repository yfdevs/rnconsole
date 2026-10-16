import logger from './core/loggerSingleton';
import consoleLogger from './core/consoleLoggerSingleton';
import type { StartConsoleLoggingOptions, StartNetworkLoggingOptions } from './core/types';

export { default } from './ui/components/NetworkLogger';
export { default as NetworkLoggerOverlay } from './ui/components/NetworkLoggerOverlay';
export type { NetworkLoggerOverlayProps } from './ui/components/NetworkLoggerOverlay';

export const startNetworkLogging = (options?: StartNetworkLoggingOptions) => {
  logger.enableXHRInterception(options);
};

export const stopNetworkLogging = () => {
  logger.disableXHRInterception();
};

export const getRequests = () => logger.getRequests();

export const clearRequests = () => logger.clearRequests();

export const startConsoleLogging = (options?: StartConsoleLoggingOptions) => {
  consoleLogger.enableInterception(options);
};

export const stopConsoleLogging = () => {
  consoleLogger.disableInterception();
};

export const getConsoleLogs = () => consoleLogger.getEntries();

export const clearConsoleLogs = () => consoleLogger.clearEntries();

export { getBackHandler } from './core/backHandler';

export type { ThemeName, Theme } from './ui/theme';
export type {
  ConsoleLogEntry,
  ConsoleLogLevel,
  StartConsoleLoggingOptions,
  StorageAdapter,
  StorageEntry,
} from './core/types';

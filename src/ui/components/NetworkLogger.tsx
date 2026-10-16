import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, Share, View } from 'react-native';
import { ScopedTheme, ScopedVariables } from 'uniwind';
import logger from '../../core/loggerSingleton';
import consoleLogger from '../../core/consoleLoggerSingleton';
import NetworkRequestInfo from '../../core/NetworkRequestInfo';
import { resolveTheme, type Theme, type ThemeName } from '../theme';
import { setBackHandler } from '../../core/backHandler';
import { ConsoleLogEntry, DeepPartial, type StorageAdapter } from '../../core/types';
import RequestList from './RequestList';
import RequestDetails from './RequestDetails';
import createHar from '../../utils/createHar';
import Unmounted from './Unmounted';
import { AppContextProvider } from './AppContext';
import ConsolePanel from './ConsolePanel';
import InspectorHeader, { type InspectorPanel } from './InspectorHeader';
import StoragePanel from './StoragePanel';

interface Props {
  theme?: ThemeName | DeepPartial<Theme>;
  sort?: 'asc' | 'desc';
  compact?: boolean;
  maxRows?: number;
  onClose?: () => void;
  storage?: StorageAdapter;
}

const sortRequests = (requests: NetworkRequestInfo[], sort: 'asc' | 'desc') => {
  if (sort === 'asc') {
    return [...requests].reverse();
  }
  return [...requests];
};

const NetworkLogger: React.FC<Props> = ({
  theme = 'light',
  sort = 'desc',
  compact = false,
  maxRows,
  onClose,
  storage,
}) => {
  const resolvedTheme = resolveTheme(theme);
  const [requests, setRequests] = useState(logger.getRequests());
  const [request, setRequest] = useState<NetworkRequestInfo>();
  const [showDetails, _setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState<boolean>(logger.isPaused);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleLogEntry[]>(
    consoleLogger.getEntries()
  );
  const [consolePaused, setConsolePaused] = useState(consoleLogger.isPaused);
  const [panel, setPanel] = useState<InspectorPanel>('network');
  const [storageCount, setStorageCount] = useState(0);

  const setShowDetails = useCallback((shouldShow: boolean) => {
    _setShowDetails(shouldShow);

    if (shouldShow) {
      setBackHandler(() => setShowDetails(false));
    } else {
      setBackHandler(undefined);
    }
  }, []);

  useEffect(() => {
    logger.setCallback((updatedRequests: NetworkRequestInfo[]) => {
      setRequests([...updatedRequests]);
    });

    logger.enableXHRInterception();
    consoleLogger.setCallback((updatedEntries: ConsoleLogEntry[]) => {
      setConsoleEntries([...updatedEntries]);
    });
    consoleLogger.enableInterception();
    setMounted(true);

    return () => {
      // no-op if component is unmounted
      logger.setCallback(() => {});
      consoleLogger.setCallback(() => {});
    };
  }, [sort]);

  useEffect(() => {
    const onBack = () => {
      if (showDetails) {
        setShowDetails(false);
        return true;
      }

      // Let default back handler take over
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBack);

    return () => backHandler.remove();
  }, [showDetails, setShowDetails]);

  const getHar = useCallback(async () => {
    const har = await createHar(logger.getRequests());
    await Share.share({
      message: JSON.stringify(har),
    });
  }, []);

  const requestsInfo = useMemo(() => {
    return sortRequests(requests, sort).map((r) => r.toRow());
  }, [sort, requests]);

  return (
    <ScopedTheme theme={resolvedTheme.name}>
      <ScopedVariables variables={resolvedTheme.variables}>
        <AppContextProvider>
          <View className="flex-1 bg-background">
            {showDetails && !!request && (
              <View className="flex-1">
                <RequestDetails onClose={() => setShowDetails(false)} request={request} />
              </View>
            )}
            <View className={showDetails && !!request ? 'hidden' : 'flex-1'}>
              <InspectorHeader
                consoleCount={consoleEntries.length}
                onClose={onClose}
                onPanelChange={setPanel}
                panel={panel}
                requestCount={requests.length}
                storageCount={storage ? storageCount : undefined}
              />
              {panel === 'network' ? (
                mounted && !logger.enabled && !requests.length ? (
                  <Unmounted />
                ) : (
                  <RequestList
                    compact={compact}
                    embedded
                    onClear={() => logger.clearRequests()}
                    onExport={() => void getHar()}
                    requestsInfo={requestsInfo}
                    maxRows={maxRows ?? requests.length}
                    paused={paused}
                    onTogglePause={() => {
                      setPaused((previous) => {
                        logger.onPausedChange(!previous);
                        return !previous;
                      });
                    }}
                    onPressItem={(id) => {
                      setRequest(requests.find((r) => r.id === id));
                      setShowDetails(true);
                    }}
                  />
                )
              ) : panel === 'console' ? (
                <ConsolePanel
                  entries={consoleEntries}
                  onClear={() => consoleLogger.clearEntries()}
                  onTogglePause={() => {
                    setConsolePaused((previous) => {
                      consoleLogger.onPausedChange(!previous);
                      return !previous;
                    });
                  }}
                  paused={consolePaused}
                />
              ) : storage ? (
                <StoragePanel onCountChange={setStorageCount} storage={storage} />
              ) : null}
            </View>
          </View>
        </AppContextProvider>
      </ScopedVariables>
    </ScopedTheme>
  );
};

export { NetworkLogger as default, Props as NetworkLoggerProps };

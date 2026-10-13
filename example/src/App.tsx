import '../global.css';

import React, { useCallback, useEffect, useState } from 'react';
import { LogBox, StatusBar, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { Button } from 'heroui-native/button';
import Activity from 'lucide-react-native/icons/activity';
import Moon from 'lucide-react-native/icons/moon';
import Send from 'lucide-react-native/icons/send';
import SquareTerminal from 'lucide-react-native/icons/square-terminal';
import { Uniwind } from 'uniwind';
import {
  NetworkLoggerOverlay,
  startConsoleLogging,
  startNetworkLogging,
  stopConsoleLogging,
  stopNetworkLogging,
  type ThemeName,
} from 'rnconsole';

LogBox.ignoreLogs(['rnconsole sample warning', 'rnconsole sample error']);

const endpoints = [
  'https://httpbin.org/status/200',
  'https://httpbin.org/status/404',
  'https://httpbin.org/status/500',
  'https://httpbin.org/delay/1',
];

const sendRequest = (url: string) =>
  new Promise<void>((resolve) => {
    const request = new XMLHttpRequest();
    request.open('GET', url);
    request.setRequestHeader('X-rnconsole-example', 'true');
    request.onloadend = () => resolve();
    request.onerror = () => resolve();
    request.send();
  });

export default function App() {
  const [theme, setTheme] = useState<ThemeName>('light');
  const [requestCount, setRequestCount] = useState(0);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    startNetworkLogging({ forceEnable: true, ignoredHosts: ['127.0.0.1'], maxRequests: 200 });
    startConsoleLogging({ maxEntries: 200 });
    return () => {
      stopNetworkLogging();
      stopConsoleLogging();
    };
  }, []);

  const makeConsoleLogs = useCallback(() => {
    console.log('Navigation completed', '/dashboard');
    console.info('Session restored', { userId: 42, plan: 'pro' });
    console.warn('rnconsole sample warning', { renderTime: 128, threshold: 100 });
    console.error('rnconsole sample error', new Error('Profile request timed out'));
    console.debug('Feature flags', { newInspector: true, compactRows: false });
    setLogCount((count) => count + 5);
  }, []);

  const makeRequests = useCallback(() => {
    setRequestCount((count) => count + endpoints.length);
    void Promise.all(endpoints.map(sendRequest));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    Uniwind.setTheme(nextTheme);
  };

  const accentIconColor = theme === 'dark' ? '#171717' : '#fafafa';
  const brandIconColor = theme === 'dark' ? '#2563eb' : '#60a5fa';
  const actionIconColor = theme === 'dark' ? '#2563eb' : '#60a5fa';

  return (
    <GestureHandlerRootView className="flex-1">
      <HeroUINativeProvider>
        <View className="flex-1 bg-background pt-safe">
          <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

          <View className="flex-row items-center border-b border-separator px-5 py-3">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-lg bg-foreground">
              <Activity color={brandIconColor} size={19} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">rnconsole</Text>
              <Text className="text-xs text-muted">In-app network & console inspector</Text>
            </View>
            <Button
              accessibilityLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              className="h-9 w-9"
              isIconOnly
              onPress={toggleTheme}
              size="sm"
              variant="ghost"
            >
              <Moon color={actionIconColor} size={17} />
            </Button>
          </View>

          <View className="flex-1 px-5 pt-8">
            <Text className="max-w-80 text-[28px] font-semibold leading-9 tracking-tight text-foreground">
              Debug requests and logs without leaving your app.
            </Text>
            <Text className="mt-3 max-w-80 text-sm leading-6 text-muted">
              Capture HTTP traffic and console output, then inspect every detail in one focused
              mobile panel.
            </Text>

            <Text className="mb-2 mt-8 text-xs font-semibold text-foreground">
              Try the inspector
            </Text>
            <View className="border-y border-separator">
              <View className="flex-row items-center py-4">
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-md bg-surface-secondary">
                  <Text className="text-xs font-semibold text-muted">1</Text>
                </View>
                <View className="min-w-0 flex-1 pr-3">
                  <Text className="text-sm font-medium text-foreground">
                    Generate sample traffic
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted">
                    Sends 200, 404, 500, and delayed requests
                  </Text>
                </View>
                <Button
                  className="h-9 rounded-md px-3"
                  onPress={makeRequests}
                  size="sm"
                  variant="primary"
                >
                  <Send color={accentIconColor} size={15} />
                  <Button.Label>Send 4</Button.Label>
                </Button>
              </View>

              <View className="flex-row items-center border-t border-separator py-4">
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-md bg-surface-secondary">
                  <Text className="text-xs font-semibold text-muted">2</Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    Generate console output
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted">
                    Adds log, info, warning, error, and debug entries
                  </Text>
                </View>
                <Button
                  className="h-9 rounded-md px-3"
                  onPress={makeConsoleLogs}
                  size="sm"
                  variant="outline"
                >
                  <SquareTerminal color={actionIconColor} size={15} />
                  <Button.Label>Log 5</Button.Label>
                </Button>
              </View>

              <View className="flex-row items-center border-t border-separator py-4">
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-md bg-surface-secondary">
                  <Text className="text-xs font-semibold text-muted">3</Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium text-foreground">Open the inspector</Text>
                  <Text className="mt-0.5 text-xs text-muted">
                    Tap Inspect, then switch between Network and Console
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-5 flex-row items-center rounded-lg bg-surface-secondary px-3 py-3">
              <View className="mr-3 h-2 w-2 rounded-full bg-foreground" />
              <Text className="min-w-0 flex-1 text-xs leading-5 text-muted">
                {requestCount === 0
                  ? logCount === 0
                    ? 'Capture is ready. Requests and logs keep collecting while the panel is closed.'
                    : `${logCount} console messages captured. Open Inspect to review them.`
                  : `${requestCount} requests and ${logCount} console messages captured.`}
              </Text>
            </View>
          </View>

          <NetworkLoggerOverlay buttonLabel="Inspect" maxRows={100} theme={theme} />
        </View>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

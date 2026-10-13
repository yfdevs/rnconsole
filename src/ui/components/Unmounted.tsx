import React from 'react';
import { Text, View } from 'react-native';

const Unmounted = () => (
  <View className="flex-1 items-center justify-center px-8">
    <Text className="text-base font-semibold text-foreground">Network capture is unavailable</Text>
    <Text className="mt-2 max-w-80 text-center text-sm leading-5 text-muted">
      Another debugging tool is probably using the XMLHttpRequest interceptor.
    </Text>
    <View className="mt-4 rounded-md bg-surface-secondary px-3 py-2">
      <Text className="font-mono text-xs text-foreground" selectable>
        startNetworkLogging({'{ forceEnable: true }'})
      </Text>
    </View>
    <Text className="mt-3 text-center text-xs leading-5 text-muted">
      Or disable the other network inspector, then reopen this panel.
    </Text>
  </View>
);

export default Unmounted;

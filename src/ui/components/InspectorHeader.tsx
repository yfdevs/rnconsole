import React from 'react';
import { View } from 'react-native';
import { Button } from 'heroui-native/button';
import { useThemeColor } from 'heroui-native/hooks';
import { Tabs } from 'heroui-native/tabs';
import X from 'lucide-react-native/icons/x';

export type InspectorPanel = 'network' | 'console' | 'storage';

interface Props {
  panel: InspectorPanel;
  requestCount: number;
  consoleCount: number;
  storageCount?: number;
  onPanelChange: (panel: InspectorPanel) => void;
  onClose?: () => void;
}

const InspectorHeader: React.FC<Props> = ({
  panel,
  requestCount,
  consoleCount,
  storageCount,
  onPanelChange,
  onClose,
}) => {
  const muted = useThemeColor('muted');

  return (
    <View className="border-b border-separator bg-background px-2 pt-safe">
      <View className="h-11 flex-row items-center">
        <Tabs
          className="min-w-0 flex-1 gap-0"
          onValueChange={(value) => onPanelChange(value as InspectorPanel)}
          value={panel}
          variant="secondary"
        >
          <Tabs.List background={null} className="h-10 w-full max-w-72 flex-row border-b-0">
            <Tabs.Indicator />
            <Tabs.Trigger className="h-10 flex-1" value="network">
              <Tabs.Label className="text-[11px]">Network · {requestCount}</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger className="h-10 flex-1" value="console">
              <Tabs.Label className="text-[11px]">Console · {consoleCount}</Tabs.Label>
            </Tabs.Trigger>
            {storageCount !== undefined && (
              <Tabs.Trigger className="h-10 flex-1" value="storage">
                <Tabs.Label className="text-[11px]">Storage · {storageCount}</Tabs.Label>
              </Tabs.Trigger>
            )}
          </Tabs.List>
        </Tabs>
        {onClose && (
          <Button
            accessibilityLabel="Close inspector"
            className="h-10 w-10"
            isIconOnly
            onPress={onClose}
            size="sm"
            variant="ghost"
          >
            <X color={muted} size={18} />
          </Button>
        )}
      </View>
    </View>
  );
};

export default InspectorHeader;

import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { useThemeColor } from 'heroui-native/hooks';
import Activity from 'lucide-react-native/icons/activity';
import NetworkLogger, { type NetworkLoggerProps } from './NetworkLogger';

interface Props extends Omit<NetworkLoggerProps, 'onClose'> {
  buttonLabel?: string;
  initiallyOpen?: boolean;
}

const NetworkLoggerOverlay: React.FC<Props> = ({
  buttonLabel = 'Inspect',
  initiallyOpen = false,
  ...loggerProps
}) => {
  const [open, setOpen] = useState(initiallyOpen);
  const accentForeground = useThemeColor('accent-foreground');

  return (
    <>
      <View className="absolute inset-0 items-end justify-end p-5" pointerEvents="box-none">
        <Button
          accessibilityLabel="Open network inspector"
          className="h-10 rounded-md px-3"
          onPress={() => setOpen(true)}
          size="sm"
          variant="primary"
        >
          <Activity color={accentForeground} size={18} />
          <Button.Label>{buttonLabel}</Button.Label>
        </Button>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        visible={open}
      >
        <NetworkLogger {...loggerProps} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
};

export { NetworkLoggerOverlay as default, type Props as NetworkLoggerOverlayProps };

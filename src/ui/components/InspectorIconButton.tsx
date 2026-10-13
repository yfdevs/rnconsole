import React from 'react';
import { Button } from 'heroui-native/button';

interface Props {
  label: string;
  children: React.ReactNode;
  onPress: () => void;
  testID?: string;
  isDisabled?: boolean;
}

const InspectorIconButton: React.FC<Props> = ({
  label,
  children,
  onPress,
  testID,
  isDisabled = false,
}) => (
  <Button
    accessibilityLabel={label}
    className="h-10 w-10"
    isDisabled={isDisabled}
    isIconOnly
    onPress={onPress}
    size="sm"
    testID={testID}
    variant="ghost"
  >
    {children}
  </Button>
);

export default InspectorIconButton;

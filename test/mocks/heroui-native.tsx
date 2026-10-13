import React, { Fragment } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

const ButtonRoot = ({ children, ...props }: any) => (
  <TouchableOpacity {...props}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </TouchableOpacity>
);
ButtonRoot.Label = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;

const ChipRoot = ({ children, ...props }: any) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);
ChipRoot.Label = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;

const CardRoot = ({ children, ...props }: any) => <View {...props}>{children}</View>;
CardRoot.Header = ({ children, ...props }: any) => <View {...props}>{children}</View>;
CardRoot.Body = ({ children, ...props }: any) => <View {...props}>{children}</View>;
CardRoot.Footer = ({ children, ...props }: any) => <View {...props}>{children}</View>;
CardRoot.Title = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;
CardRoot.Description = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;

const SearchFieldRoot = ({ children, ...props }: any) => <View {...props}>{children}</View>;
SearchFieldRoot.Group = ({ children, ...props }: any) => <View {...props}>{children}</View>;
SearchFieldRoot.SearchIcon = () => <Fragment />;
SearchFieldRoot.Input = (props: any) => <TextInput {...props} />;
SearchFieldRoot.ClearButton = () => <Fragment />;

const TabsRoot = ({ children, ...props }: any) => <View {...props}>{children}</View>;
TabsRoot.List = ({ children, ...props }: any) => <View {...props}>{children}</View>;
TabsRoot.ScrollView = ({ children, ...props }: any) => <View {...props}>{children}</View>;
TabsRoot.Indicator = () => <Fragment />;
TabsRoot.Trigger = ({ children, ...props }: any) => (
  <TouchableOpacity {...props}>{children}</TouchableOpacity>
);
TabsRoot.Label = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;
TabsRoot.Content = ({ children, ...props }: any) => <View {...props}>{children}</View>;

export const Button = ButtonRoot as any;
export const Card = CardRoot as any;
export const Chip = ChipRoot as any;
export const SearchField = SearchFieldRoot as any;
export const Tabs = TabsRoot as any;
export const HeroUINativeProvider = ({ children }: { children: React.ReactNode }) => children;
export const useThemeColor = (name: string | string[]) =>
  Array.isArray(name) ? name.map(() => '#111111') : '#111111';

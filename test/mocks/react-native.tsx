import React, { Fragment } from 'react';
import { vi } from 'vite-plus/test';

const host = (name: string) => name;

export const View = host('View');
export const Text = host('Text');
export const Image = host('Image');
export const Modal = host('Modal');
export const ScrollView = host('ScrollView');
export const TextInput = host('TextInput');
export const TouchableOpacity = host('TouchableOpacity');
export const TouchableWithoutFeedback = host('TouchableWithoutFeedback');
export const Pressable = host('Pressable');

export const FlatList = ({ data = [], renderItem }: any) => (
  <Fragment>
    {data.map((item: unknown, index: number) => (
      <Fragment key={index}>{renderItem({ item, index })}</Fragment>
    ))}
  </Fragment>
);

const flatten = (style: any): any => {
  if (!Array.isArray(style)) return style;
  return Object.assign({}, ...style.filter(Boolean).map(flatten));
};

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten,
  hairlineWidth: 1,
};

export const Share = { share: vi.fn() };
export const Alert = { alert: vi.fn() };
export const BackHandler = {
  addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  removeEventListener: vi.fn(),
};
export const Platform = {
  OS: 'ios',
  select: (options: Record<string, unknown>) => options.ios ?? options.default,
};

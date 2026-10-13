import React, { Fragment, type ReactNode } from 'react';

export const ScopedTheme = ({ children }: { theme: string; children: ReactNode }) => (
  <Fragment>{children}</Fragment>
);

export const ScopedVariables = ({ children }: { variables: object; children: ReactNode }) => (
  <Fragment>{children}</Fragment>
);

export const Uniwind = {
  currentTheme: 'light',
  setTheme: vi.fn(),
};

export const useCSSVariable = (name: string) =>
  name === '--color-primary' ? '#18181b' : '#71717a';

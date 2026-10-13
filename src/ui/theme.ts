import type { DeepPartial } from '../core/types';

export type ThemeName = 'light' | 'dark';

export type Theme = {
  colors: {
    background: string;
    link: string;
    card: string;
    text: string;
    statusGood: string;
    statusWarning: string;
    statusBad: string;
    secondary: string;
    onSecondary: string;
    muted: string;
  };
};

const colorVariables: Record<keyof Theme['colors'], string> = {
  background: '--color-background',
  link: '--color-primary',
  card: '--color-card',
  text: '--color-foreground',
  statusGood: '--color-success',
  statusWarning: '--color-warning',
  statusBad: '--color-destructive',
  secondary: '--color-secondary',
  onSecondary: '--color-secondary-foreground',
  muted: '--color-muted-foreground',
};

export const resolveTheme = (theme: ThemeName | DeepPartial<Theme>) => {
  if (typeof theme === 'string') {
    return { name: theme, variables: {} };
  }

  const variables = Object.entries(theme.colors ?? {}).reduce<Record<string, string | number>>(
    (result, [name, value]) => {
      if (value !== undefined) {
        result[colorVariables[name as keyof Theme['colors']]] = value;
      }
      return result;
    },
    {}
  );

  return { name: 'light' as const, variables };
};

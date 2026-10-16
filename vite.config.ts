import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    ignorePatterns: ['lib/**', 'coverage/**', 'example/src/uniwind-types.d.ts'],
    singleQuote: true,
    sortPackageJson: true,
    trailingComma: 'es5',
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ['react', 'typescript', 'oxc'],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    rules: {
      'no-underscore-dangle': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/exhaustive-effect-dependencies': 'off',
      'react/immutability': 'off',
      'react/memo-dependencies': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/set-state-in-effect': 'off',
      'typescript/no-floating-promises': 'off',
      'typescript/no-generated-empty-object-type': 'off',
      'typescript/no-misused-spread': 'off',
      'typescript/no-unnecessary-template-expression': 'off',
      'typescript/no-unsafe-type-assertion': 'off',
      'typescript/no-useless-default-assignment': 'off',
      'typescript/unbound-method': 'off',
    },
  },
  test: {
    alias: [
      {
        find: /^react-native$/,
        replacement: new URL('./test/mocks/react-native.tsx', import.meta.url).pathname,
      },
      {
        find: /^@testing-library\/react-native$/,
        replacement: new URL('./test/support/testing-library.ts', import.meta.url).pathname,
      },
      {
        find: /^@react-native-clipboard\/clipboard$/,
        replacement: new URL('./test/mocks/clipboard.ts', import.meta.url).pathname,
      },
      {
        find: /^react-native-gesture-handler$/,
        replacement: new URL('./test/mocks/gesture-handler.tsx', import.meta.url).pathname,
      },
      {
        find: /^uniwind$/,
        replacement: new URL('./test/mocks/uniwind.tsx', import.meta.url).pathname,
      },
      {
        find: /^heroui-native(?:\/.+)?$/,
        replacement: new URL('./test/mocks/heroui-native.tsx', import.meta.url).pathname,
      },
      {
        find: /^lucide-react-native$/,
        replacement: new URL('./test/mocks/lucide-react-native.tsx', import.meta.url).pathname,
      },
      {
        find: /^lucide-react-native\/icons\/.+$/,
        replacement: new URL('./test/mocks/lucide-react-native.tsx', import.meta.url).pathname,
      },
    ],
    globals: true,
    setupFiles: ['./test/setup.ts'],
    exclude: ['example/**', 'lib/**', 'node_modules/**'],
  },
  pack: {
    entry: {
      index: 'src/index.tsx',
      'index.web': 'src/index.web.tsx',
    },
    clean: true,
    dts: true,
    deps: {
      neverBundle: [
        '@react-native-clipboard/clipboard',
        'heroui-native',
        'react',
        'react-native',
        'react-native-gesture-handler',
        'react-native-reanimated',
        'react-native-safe-area-context',
        'react-native-worklets',
      ],
    },
    format: ['esm'],
    loader: {
      '.png': 'asset',
    },
    outDir: 'lib',
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
    platform: 'neutral',
    sourcemap: true,
    target: 'es2020',
    unbundle: true,
  },
});

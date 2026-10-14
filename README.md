# rnconsole

React Native 应用内调试工具。默认以浮动按钮挂载，点击后打开类似 Chrome DevTools 的全屏面板，可在 Network 与 Console 之间切换，查看请求详情和应用日志。

## 使用

安装库以及 HeroUI Native 所需依赖：

```bash
pnpm add @yfdevs/rnconsole heroui-native uniwind tailwindcss react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-worklets react-native-svg lucide-react-native tailwind-merge tailwind-variants
```

在应用入口最前面引入手势库，并用 Provider 包住应用：

```tsx
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native/provider';
import { NetworkLoggerOverlay, startConsoleLogging, startNetworkLogging } from '@yfdevs/rnconsole';

startNetworkLogging();
startConsoleLogging();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <YourApp />
        <NetworkLoggerOverlay maxRows={100} />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
```

Expo 开发环境可能已启用自己的 XHR 拦截器；示例中可使用
`startNetworkLogging({ forceEnable: true })` 让 rnconsole 接管记录。当前版本记录
`XMLHttpRequest` 请求；若应用使用新版 React Native 的原生 `fetch` 路径，需要按需改用 XHR 或后续接入 fetch 拦截器。

CSS 入口需要载入 HeroUI 和 rnconsole 主题：

```css
@import 'tailwindcss';
@import 'uniwind';
@import 'heroui-native/styles';
@import '@yfdevs/rnconsole/theme.css';

@source '../node_modules/@yfdevs/rnconsole/src';
```

如果需要把面板嵌入已有页面，仍可直接使用默认导出的 `NetworkLogger`。

## 面板能力

- 按 URL、GraphQL operation、Method、状态码筛选
- 捕获 `console.log`、`info`、`warn`、`error`、`debug`
- 按日志等级与内容筛选，展开查看对象、数组和 Error 参数
- Network 与 Console 分别暂停/恢复和清空，Network 支持导出 HAR
- Headers、Payload、Response、Timing 分栏详情
- 明暗主题和自定义主题变量

Console 默认保存最近 500 条日志，可通过 `startConsoleLogging({ maxEntries: 200 })`
调整。需要在应用卸载或测试清理时恢复原始 console 方法，可调用 `stopConsoleLogging()`。

## 开发

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm example
```

import type { ConsoleLogEntry, ConsoleLogLevel, StartConsoleLoggingOptions } from './types';

const CONSOLE_LEVELS: ConsoleLogLevel[] = ['log', 'info', 'warn', 'error', 'debug'];
const DEFAULT_MAX_ENTRIES = 500;

type ConsoleMethod = (...data: unknown[]) => void;

const formatPrimitive = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'number' || typeof value === 'boolean') return `${value}`;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  return Object.prototype.toString.call(value);
};

const normalizeValue = (value: unknown, seen: WeakSet<object>, depth = 0): unknown => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      ...(value.stack ? { stack: value.stack } : {}),
    };
  }

  if (value === null || typeof value !== 'object') {
    if (typeof value === 'bigint') return `${value}n`;
    if (typeof value === 'symbol' || typeof value === 'function') return formatPrimitive(value);
    return value;
  }

  if (seen.has(value)) return '[Circular]';
  if (depth >= 5) return '[Max depth]';
  seen.add(value);

  if (Array.isArray(value)) {
    const items = value.slice(0, 50).map((item) => normalizeValue(item, seen, depth + 1));
    if (value.length > 50) items.push(`[+${value.length - 50} more items]`);
    return items;
  }

  const output: Record<string, unknown> = {};
  try {
    Object.keys(value)
      .slice(0, 50)
      .forEach((key) => {
        try {
          output[key] = normalizeValue((value as Record<string, unknown>)[key], seen, depth + 1);
        } catch {
          output[key] = '[Unreadable]';
        }
      });
  } catch {
    return Object.prototype.toString.call(value);
  }
  return output;
};

const formatStructuredValue = (value: unknown) => {
  try {
    return JSON.stringify(normalizeValue(value, new WeakSet()), null, 2);
  } catch {
    return Object.prototype.toString.call(value);
  }
};

const formatPreview = (value: unknown) => {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value === null || typeof value !== 'object') return formatPrimitive(value);

  const formatted = formatStructuredValue(value).replace(/\s+/g, ' ').trim();
  return formatted.length > 180 ? `${formatted.slice(0, 177)}…` : formatted;
};

export const formatConsoleArguments = (args: unknown[]) => {
  const hasStructuredData = args.some(
    (argument) => argument instanceof Error || (argument !== null && typeof argument === 'object')
  );
  const message = args.map(formatPreview).join(' ');
  const detail = args
    .map((argument, index) => {
      const formatted =
        argument instanceof Error || (argument !== null && typeof argument === 'object')
          ? formatStructuredValue(argument)
          : formatPrimitive(argument);
      return args.length > 1 ? `[${index}] ${formatted}` : formatted;
    })
    .join('\n\n');

  return { message, detail, hasStructuredData };
};

export default class ConsoleLogger {
  private entries: ConsoleLogEntry[] = [];
  private pausedEntries: ConsoleLogEntry[] = [];
  private maxEntries = DEFAULT_MAX_ENTRIES;
  private paused = false;
  private nextId = 0;
  private originalMethods = new Map<ConsoleLogLevel, ConsoleMethod>();
  private wrappedMethods = new Map<ConsoleLogLevel, ConsoleMethod>();
  public enabled = false;

  callback = (_entries: ConsoleLogEntry[]) => {};

  get isPaused() {
    return this.paused;
  }

  setCallback = (callback: (entries: ConsoleLogEntry[]) => void) => {
    this.callback = callback;
  };

  private notify = () => {
    this.callback([...this.entries]);
  };

  private record = (level: ConsoleLogLevel, args: unknown[]) => {
    const formatted = formatConsoleArguments(args);
    const entry: ConsoleLogEntry = {
      id: `${this.nextId++}`,
      level,
      timestamp: Date.now(),
      ...formatted,
    };
    const target = this.paused ? this.pausedEntries : this.entries;
    target.unshift(entry);

    const total = this.entries.length + this.pausedEntries.length;
    if (total > this.maxEntries) {
      if (this.entries.length > 0) this.entries.pop();
      else this.pausedEntries.pop();
    }

    if (!this.paused) this.notify();
  };

  enableInterception = (options?: StartConsoleLoggingOptions) => {
    if (this.enabled) return;
    if (
      options?.maxEntries !== undefined &&
      (typeof options.maxEntries !== 'number' || options.maxEntries < 1)
    ) {
      return;
    }
    if (options?.maxEntries !== undefined) this.maxEntries = options.maxEntries;

    CONSOLE_LEVELS.forEach((level) => {
      const original = console[level].bind(console) as ConsoleMethod;
      const wrapped: ConsoleMethod = (...args) => {
        original(...args);
        this.record(level, args);
      };
      this.originalMethods.set(level, original);
      this.wrappedMethods.set(level, wrapped);
      console[level] = wrapped as (typeof console)[typeof level];
    });
    this.enabled = true;
  };

  disableInterception = () => {
    if (!this.enabled) return;
    CONSOLE_LEVELS.forEach((level) => {
      const original = this.originalMethods.get(level);
      const wrapped = this.wrappedMethods.get(level);
      if (original && wrapped && console[level] === wrapped) {
        console[level] = original as (typeof console)[typeof level];
      }
    });
    this.originalMethods.clear();
    this.wrappedMethods.clear();
    this.entries = [];
    this.pausedEntries = [];
    this.maxEntries = DEFAULT_MAX_ENTRIES;
    this.paused = false;
    this.nextId = 0;
    this.enabled = false;
  };

  getEntries = () => this.entries;

  clearEntries = () => {
    this.entries = [];
    this.pausedEntries = [];
    this.notify();
  };

  onPausedChange = (paused: boolean) => {
    if (this.paused === paused) return;
    this.paused = paused;
    if (!paused && this.pausedEntries.length) {
      this.entries = [...this.pausedEntries, ...this.entries].slice(0, this.maxEntries);
      this.pausedEntries = [];
      this.notify();
    }
  };
}

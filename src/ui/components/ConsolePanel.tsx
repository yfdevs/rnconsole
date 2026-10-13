import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { Chip } from 'heroui-native/chip';
import { useThemeColor } from 'heroui-native/hooks';
import { SearchField } from 'heroui-native/search-field';
import Bug from 'lucide-react-native/icons/bug';
import Broom from 'lucide-react-native/icons/broom';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import Info from 'lucide-react-native/icons/info';
import MessageSquare from 'lucide-react-native/icons/message-square';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import type { ConsoleLogEntry, ConsoleLogLevel } from '../../core/types';
import { cn } from '../../utils/cn';
import InspectorIconButton from './InspectorIconButton';

interface Props {
  entries: ConsoleLogEntry[];
  paused: boolean;
  onTogglePause: () => void;
  onClear: () => void;
}

const levels: Array<{
  label: string;
  value: ConsoleLogLevel;
  color: 'default' | 'accent' | 'warning' | 'danger';
}> = [
  { label: 'Log', value: 'log', color: 'default' },
  { label: 'Info', value: 'info', color: 'accent' },
  { label: 'Warn', value: 'warn', color: 'warning' },
  { label: 'Error', value: 'error', color: 'danger' },
  { label: 'Debug', value: 'debug', color: 'default' },
];

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

const ConsoleRow = ({ entry }: { entry: ConsoleLogEntry }) => {
  const [expanded, setExpanded] = useState(false);
  const [muted, foreground, link, warning, danger] = useThemeColor([
    'muted',
    'foreground',
    'link',
    'warning',
    'danger',
  ]);
  const iconColor =
    entry.level === 'error'
      ? danger
      : entry.level === 'warn'
        ? warning
        : entry.level === 'info'
          ? link
          : entry.level === 'debug'
            ? muted
            : foreground;
  const Icon =
    entry.level === 'error'
      ? CircleAlert
      : entry.level === 'warn'
        ? TriangleAlert
        : entry.level === 'info'
          ? Info
          : entry.level === 'debug'
            ? Bug
            : MessageSquare;

  return (
    <Pressable
      accessibilityHint={entry.hasStructuredData ? 'Shows structured arguments' : undefined}
      accessibilityLabel={`${entry.level}: ${entry.message || 'empty message'}`}
      accessibilityRole={entry.hasStructuredData ? 'button' : undefined}
      className={cn(
        'border-b border-separator px-3 py-2.5 active:bg-surface-secondary',
        entry.level === 'error' && 'bg-danger/5',
        entry.level === 'warn' && 'bg-warning/5'
      )}
      disabled={!entry.hasStructuredData}
      onPress={() => setExpanded((value) => !value)}
    >
      <View className="flex-row items-start">
        <View className="h-6 w-6 items-center justify-center">
          <Icon color={iconColor} size={15} />
        </View>
        <Text
          className="min-w-0 flex-1 px-1 font-mono text-[11px] leading-5 text-foreground"
          numberOfLines={expanded ? undefined : 3}
        >
          {entry.message || '(empty)'}
        </Text>
        <View className="ml-2 flex-row items-center pt-0.5">
          <Text className="font-mono text-[9px] text-muted">{formatTime(entry.timestamp)}</Text>
          {entry.hasStructuredData &&
            (expanded ? (
              <ChevronDown color={muted} size={14} />
            ) : (
              <ChevronRight color={muted} size={14} />
            ))}
        </View>
      </View>
      {expanded && entry.hasStructuredData && (
        <ScrollView
          className="ml-7 mt-2 rounded-md border border-separator bg-surface-secondary"
          horizontal
        >
          <Text className="p-3 font-mono text-[10px] leading-4 text-foreground" selectable>
            {entry.detail}
          </Text>
        </ScrollView>
      )}
    </Pressable>
  );
};

const ConsolePanel: React.FC<Props> = ({ entries, paused, onTogglePause, onClear }) => {
  const [search, setSearch] = useState('');
  const [activeLevels, setActiveLevels] = useState<Set<ConsoleLogLevel>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [foreground, muted, accentForeground, link, danger, warning, success] = useThemeColor([
    'foreground',
    'muted',
    'accent-foreground',
    'link',
    'danger',
    'warning',
    'success',
  ]);
  const query = search.toLowerCase().trim();
  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (!query ||
            entry.message.toLowerCase().includes(query) ||
            entry.detail.toLowerCase().includes(query) ||
            entry.level.includes(query)) &&
          (activeLevels.size === 0 || activeLevels.has(entry.level))
      ),
    [activeLevels, entries, query]
  );
  const filterActive = activeLevels.size > 0;

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-separator bg-background px-2 pb-2">
        <View className="h-10 flex-row items-center gap-1">
          <View className="mr-auto flex-row items-center px-1">
            <View
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: paused ? warning : success }}
            />
            <Text className="text-xs font-medium text-foreground">
              {paused ? 'Capture paused' : 'Capturing logs'}
            </Text>
            <Text className="ml-2 font-mono text-[10px] text-muted">
              {filteredEntries.length === entries.length
                ? `${entries.length} messages`
                : `${filteredEntries.length} of ${entries.length}`}
            </Text>
          </View>
          <InspectorIconButton
            label={paused ? 'Resume console capture' : 'Pause console capture'}
            onPress={onTogglePause}
            testID="toggle-console-recording"
          >
            {paused ? <Play color={success} size={16} /> : <Pause color={danger} size={16} />}
          </InspectorIconButton>
          <InspectorIconButton
            isDisabled={entries.length === 0}
            label="Clear console"
            onPress={onClear}
            testID="clear-console"
          >
            <Broom color={danger} size={16} />
          </InspectorIconButton>
        </View>

        <View className="flex-row items-center gap-2">
          <SearchField
            animation="disable-all"
            className="min-w-0 flex-1"
            onChange={setSearch}
            value={search}
          >
            <SearchField.Group className="h-9 min-h-0">
              <SearchField.SearchIcon iconProps={{ size: 15 }} />
              <SearchField.Input
                accessibilityLabel="Filter console messages"
                className="h-9 min-h-0 rounded-md py-0 text-xs"
                placeholder="Filter console messages"
              />
              <SearchField.ClearButton accessibilityLabel="Clear search" className="h-7 w-7" />
            </SearchField.Group>
          </SearchField>
          <Button
            accessibilityLabel="Filter console levels"
            className="h-9 w-9 rounded-md"
            isIconOnly
            onPress={() => setShowFilters((value) => !value)}
            size="sm"
            variant={filterActive || showFilters ? 'primary' : 'outline'}
          >
            <SlidersHorizontal
              color={filterActive || showFilters ? accentForeground : link}
              size={16}
            />
          </Button>
        </View>

        {showFilters && (
          <View className="mt-2 border-t border-separator pt-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-medium text-foreground">Log level</Text>
              <Button
                accessibilityElementsHidden={!filterActive}
                className="h-7 px-2"
                isDisabled={!filterActive}
                onPress={() => setActiveLevels(new Set())}
                pointerEvents={filterActive ? 'auto' : 'none'}
                size="sm"
                style={{ opacity: filterActive ? 1 : 0 }}
                variant="ghost"
              >
                <Button.Label className="text-[11px]">Reset</Button.Label>
              </Button>
            </View>
            <ScrollView
              contentContainerClassName="gap-1.5 pr-2"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Chip
                animation="disable-all"
                className="h-7 rounded-md border border-field-border px-2.5"
                color={activeLevels.size === 0 ? 'accent' : 'default'}
                onPress={() => setActiveLevels(new Set())}
                size="sm"
                variant={activeLevels.size === 0 ? 'primary' : 'tertiary'}
              >
                <Chip.Label className="font-mono text-[10px] font-semibold">ALL</Chip.Label>
              </Chip>
              {levels.map(({ label, value, color }) => {
                const active = activeLevels.has(value);
                const dotColor =
                  value === 'error'
                    ? danger
                    : value === 'warn'
                      ? warning
                      : value === 'info'
                        ? link
                        : value === 'debug'
                          ? muted
                          : foreground;
                return (
                  <Chip
                    animation="disable-all"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    className="h-7 rounded-md border border-field-border px-2.5"
                    color={active ? color : 'default'}
                    key={value}
                    onPress={() => {
                      const next = new Set(activeLevels);
                      if (next.has(value)) next.delete(value);
                      else next.add(value);
                      setActiveLevels(next);
                    }}
                    size="sm"
                    variant={active ? 'soft' : 'tertiary'}
                  >
                    <View
                      className="mr-1.5 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <Chip.Label className="text-[10px] font-medium">{label}</Chip.Label>
                  </Chip>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {paused && (
        <View className="border-b border-separator bg-surface-secondary px-3 py-1.5">
          <Text className="text-center text-[11px] font-medium text-foreground">
            Console capture paused · new messages are held
          </Text>
        </View>
      )}

      <View className="h-7 flex-row items-center border-b border-separator bg-surface-secondary px-3">
        <Text className="font-mono text-[9px] font-medium text-muted">MESSAGE</Text>
        <Text className="ml-auto font-mono text-[9px] font-medium text-muted">TIME</Text>
      </View>
      <FlatList
        ListEmptyComponent={
          <View className="items-center px-8 py-12">
            <Text className="text-sm font-semibold text-foreground">
              {entries.length === 0 ? 'No console messages yet' : 'No matching messages'}
            </Text>
            <Text className="mt-1 max-w-72 text-center text-xs leading-5 text-muted">
              {entries.length === 0
                ? 'Calls to console.log, info, warn, error, and debug will appear here.'
                : 'Try a different message or log-level filter.'}
            </Text>
            {entries.length > 0 && (filterActive || search) && (
              <Button
                className="mt-3 h-8 rounded-md px-3"
                onPress={() => {
                  setSearch('');
                  setActiveLevels(new Set());
                }}
                size="sm"
                variant="outline"
              >
                Clear filters
              </Button>
            )}
          </View>
        }
        contentContainerClassName="pb-safe"
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <ConsoleRow entry={item} />}
      />
    </View>
  );
};

export default ConsolePanel;

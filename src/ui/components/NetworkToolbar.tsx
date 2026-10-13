import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { Chip } from 'heroui-native/chip';
import { useThemeColor } from 'heroui-native/hooks';
import { SearchField } from 'heroui-native/search-field';
import Download from 'lucide-react-native/icons/download';
import Broom from 'lucide-react-native/icons/broom';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import SlidersHorizontal from 'lucide-react-native/icons/sliders-horizontal';
import X from 'lucide-react-native/icons/x';
import { cn } from '../../utils/cn';
import { useAppContext } from './AppContext';
import InspectorIconButton from './InspectorIconButton';

interface Props {
  requestCount: number;
  visibleCount: number;
  paused: boolean;
  onTogglePause: () => void;
  onClear: () => void;
  onExport: () => void;
  onClose?: () => void;
  embedded?: boolean;
}

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'] as const;

const NetworkToolbar: React.FC<Props> = ({
  requestCount,
  visibleCount,
  paused,
  onTogglePause,
  onClear,
  onExport,
  onClose,
  embedded = false,
}) => {
  const { search, filter, filterActive, dispatch } = useAppContext();
  const [showFilters, setShowFilters] = useState(false);
  const [muted, accentForeground, link, danger, warning, success] = useThemeColor([
    'muted',
    'accent-foreground',
    'link',
    'danger',
    'warning',
    'success',
  ]);

  return (
    <View
      className={cn(
        'border-b border-separator bg-background px-2 pb-2',
        embedded ? 'pt-0' : 'pt-safe-offset-1'
      )}
    >
      <View className="h-10 flex-row items-center gap-1">
        <View className="mr-auto flex-row items-center px-1">
          <View
            className="mr-2 h-2 w-2 rounded-full"
            style={{ backgroundColor: paused ? warning : danger }}
          />
          <Text className="text-xs font-medium text-foreground">
            {paused ? 'Capture paused' : 'Capturing requests'}
          </Text>
          <Text className="ml-2 font-mono text-[10px] text-muted">
            {visibleCount === requestCount
              ? `${requestCount} requests`
              : `${visibleCount} of ${requestCount}`}
          </Text>
        </View>
        <InspectorIconButton
          label={paused ? 'Resume recording' : 'Pause recording'}
          onPress={onTogglePause}
          testID="toggle-recording"
        >
          {paused ? <Play color={success} size={16} /> : <Pause color={danger} size={16} />}
        </InspectorIconButton>
        <InspectorIconButton
          isDisabled={requestCount === 0}
          label="Clear requests"
          onPress={onClear}
          testID="clear-logs"
        >
          <Broom color={danger} size={16} />
        </InspectorIconButton>
        <InspectorIconButton
          isDisabled={requestCount === 0}
          label="Export HAR"
          onPress={onExport}
          testID="export-har"
        >
          <Download color={link} size={16} />
        </InspectorIconButton>
        {onClose && (
          <InspectorIconButton label="Close network panel" onPress={onClose}>
            <X color={muted} size={18} />
          </InspectorIconButton>
        )}
      </View>

      <View className="flex-row items-center gap-2">
        <SearchField
          animation="disable-all"
          className="min-w-0 flex-1"
          onChange={(value) => dispatch({ type: 'SET_SEARCH', payload: value })}
          value={search}
        >
          <SearchField.Group className="h-9 min-h-0">
            <SearchField.SearchIcon iconProps={{ size: 15 }} />
            <SearchField.Input
              accessibilityLabel="Filter requests"
              className="h-9 min-h-0 rounded-md py-0 text-xs"
              placeholder="Filter requests"
            />
            <SearchField.ClearButton accessibilityLabel="Clear search" className="h-7 w-7" />
          </SearchField.Group>
        </SearchField>
        <Button
          accessibilityLabel="Filter requests"
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
            <Text className="text-[11px] font-medium text-foreground">Filters</Text>
            <Button
              accessibilityElementsHidden={!filterActive}
              className="h-7 px-2"
              isDisabled={!filterActive}
              onPress={() => dispatch({ type: 'CLEAR_FILTER' })}
              pointerEvents={filterActive ? 'auto' : 'none'}
              size="sm"
              style={{ opacity: filterActive ? 1 : 0 }}
              variant="ghost"
            >
              <Button.Label className="text-[11px]">Reset</Button.Label>
            </Button>
          </View>
          <View className="mt-1.5 flex-row items-center">
            <Text className="w-14 text-[10px] font-medium text-muted">Method</Text>
            <ScrollView
              className="min-w-0 flex-1"
              contentContainerClassName="gap-1.5 pr-2"
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Chip
                animation="disable-all"
                className="h-7 rounded-md border border-field-border px-2.5"
                color={(filter.methods?.size ?? 0) === 0 ? 'accent' : 'default'}
                onPress={() =>
                  dispatch({ type: 'SET_FILTER', payload: { ...filter, methods: new Set() } })
                }
                size="sm"
                variant={(filter.methods?.size ?? 0) === 0 ? 'primary' : 'tertiary'}
              >
                <Chip.Label className="font-mono text-[10px] font-semibold">ALL</Chip.Label>
              </Chip>
              {methods.map((method) => {
                const active = filter.methods?.has(method) ?? false;
                return (
                  <Chip
                    animation="disable-all"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    className="h-7 rounded-md border border-field-border px-2.5"
                    color={active ? 'accent' : 'default'}
                    key={method}
                    onPress={() => {
                      const nextMethods = new Set(filter.methods);
                      if (nextMethods.has(method)) nextMethods.delete(method);
                      else nextMethods.add(method);
                      dispatch({
                        type: 'SET_FILTER',
                        payload: { ...filter, methods: nextMethods },
                      });
                    }}
                    size="sm"
                    variant={active ? 'primary' : 'tertiary'}
                  >
                    <Chip.Label className="font-mono text-[10px] font-semibold">
                      {method}
                    </Chip.Label>
                  </Chip>
                );
              })}
            </ScrollView>
          </View>

          <View className="mt-2 flex-row items-center">
            <Text className="w-14 text-[10px] font-medium text-muted">Status</Text>
            <TextInput
              accessibilityLabel="Status code"
              className="h-8 w-20 rounded-md border border-field-border bg-background px-2 py-0 font-mono text-xs text-foreground"
              keyboardType="number-pad"
              maxLength={3}
              onChangeText={(text) => {
                const status = Number.parseInt(text, 10);
                dispatch({
                  type: 'SET_FILTER',
                  payload: {
                    ...filter,
                    statusErrors: false,
                    status: Number.isNaN(status) ? undefined : status,
                  },
                });
              }}
              placeholder="Status"
              placeholderTextColor={muted}
              textAlignVertical="center"
              value={filter.status?.toString() ?? ''}
            />
            <Chip
              animation="disable-all"
              className="ml-1.5 h-8 rounded-md border border-field-border px-3"
              color={filter.statusErrors ? 'danger' : 'default'}
              onPress={() =>
                dispatch({
                  type: 'SET_FILTER',
                  payload: {
                    ...filter,
                    status: undefined,
                    statusErrors: !filter.statusErrors,
                  },
                })
              }
              size="sm"
              variant={filter.statusErrors ? 'soft' : 'tertiary'}
            >
              <Chip.Label className="text-[11px] font-medium">Errors</Chip.Label>
            </Chip>
          </View>
        </View>
      )}
    </View>
  );
};

export default NetworkToolbar;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Button } from 'heroui-native/button';
import { SearchField } from 'heroui-native/search-field';
import { useThemeColor } from 'heroui-native/hooks';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Copy from 'lucide-react-native/icons/copy';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import Save from 'lucide-react-native/icons/save';
import Trash2 from 'lucide-react-native/icons/trash-2';
import type { StorageAdapter, StorageEntry } from '../../core/types';
import InspectorIconButton from './InspectorIconButton';

interface Props {
  storage: StorageAdapter;
  onCountChange?: (count: number) => void;
}

const formatError = (error: unknown) =>
  error instanceof Error ? error.message : 'The storage operation could not be completed.';

const formatPreview = (value: string | null) => {
  if (value === null) return '(null)';
  const compact = value.replace(/\s+/g, ' ').trim();
  return compact.length > 120 ? `${compact.slice(0, 117)}…` : compact || '(empty string)';
};

const loadEntries = async (storage: StorageAdapter): Promise<StorageEntry[]> => {
  const keys = [...(await storage.getAllKeys())].sort((left, right) => left.localeCompare(right));
  const values = storage.getMany
    ? await storage.getMany(keys)
    : Object.fromEntries(
        await Promise.all(keys.map(async (key) => [key, await storage.getItem(key)] as const))
      );

  return keys.map((key) => ({ key, value: values[key] ?? null }));
};

const StoragePanel: React.FC<Props> = ({ storage, onCountChange }) => {
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [search, setSearch] = useState('');
  const [expandedKey, setExpandedKey] = useState<string>();
  const [draftValue, setDraftValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [copiedKey, setCopiedKey] = useState<string>();
  const refreshId = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [muted, link, danger, accentForeground] = useThemeColor([
    'muted',
    'link',
    'danger',
    'accent-foreground',
  ]);

  const refresh = useCallback(async () => {
    const currentRefreshId = ++refreshId.current;
    setLoading(true);
    setError(undefined);
    try {
      const nextEntries = await loadEntries(storage);
      if (currentRefreshId !== refreshId.current) return;
      setEntries(nextEntries);
      onCountChange?.(nextEntries.length);
      setExpandedKey((current) =>
        current && nextEntries.some((entry) => entry.key === current) ? current : undefined
      );
    } catch (nextError) {
      if (currentRefreshId !== refreshId.current) return;
      setError(formatError(nextError));
    } finally {
      if (currentRefreshId === refreshId.current) setLoading(false);
    }
  }, [onCountChange, storage]);

  useEffect(() => {
    void refresh();
    return () => {
      refreshId.current += 1;
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [refresh]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter(
      (entry) =>
        entry.key.toLowerCase().includes(query) || entry.value?.toLowerCase().includes(query)
    );
  }, [entries, search]);

  const expand = (entry: StorageEntry) => {
    if (expandedKey === entry.key) {
      setExpandedKey(undefined);
      return;
    }
    setExpandedKey(entry.key);
    setDraftValue(entry.value ?? '');
    setError(undefined);
  };

  const copy = (key: string, value: string) => {
    Clipboard.setString(value);
    setCopiedKey(key);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(
      () => setCopiedKey((current) => (current === key ? undefined : current)),
      1400
    );
  };

  const save = async (key: string) => {
    setSaving(true);
    setError(undefined);
    try {
      await storage.setItem(key, draftValue);
      setEntries((current) =>
        current.map((entry) => (entry.key === key ? { ...entry, value: draftValue } : entry))
      );
    } catch (nextError) {
      setError(formatError(nextError));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (key: string) => {
    setSaving(true);
    setError(undefined);
    try {
      await storage.removeItem(key);
      setEntries((current) => {
        const nextEntries = current.filter((entry) => entry.key !== key);
        onCountChange?.(nextEntries.length);
        return nextEntries;
      });
      setExpandedKey(undefined);
    } catch (nextError) {
      setError(formatError(nextError));
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = (key: string) => {
    Alert.alert('Delete storage entry?', `“${key}” will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void remove(key) },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="border-b border-separator bg-background px-2 pb-2">
        <View className="h-10 flex-row items-center px-1">
          <View className="mr-auto">
            <Text className="text-xs font-medium text-foreground">Key-value storage</Text>
            <Text className="mt-0.5 font-mono text-[10px] text-muted">
              {loading
                ? 'Loading…'
                : filteredEntries.length === entries.length
                  ? `${entries.length} entries`
                  : `${filteredEntries.length} of ${entries.length}`}
            </Text>
          </View>
          <InspectorIconButton label="Refresh storage" onPress={() => void refresh()}>
            <RefreshCw color={link} size={16} />
          </InspectorIconButton>
        </View>
        <SearchField animation="disable-all" onChange={setSearch} value={search}>
          <SearchField.Group className="h-9 min-h-0">
            <SearchField.SearchIcon iconProps={{ size: 15 }} />
            <SearchField.Input
              accessibilityLabel="Filter storage entries"
              className="h-9 min-h-0 rounded-md py-0 text-xs"
              placeholder="Filter keys or values"
            />
            <SearchField.ClearButton accessibilityLabel="Clear search" className="h-7 w-7" />
          </SearchField.Group>
        </SearchField>
      </View>

      {error && (
        <View className="flex-row items-center border-b border-separator bg-surface-secondary px-3 py-2">
          <Text className="min-w-0 flex-1 text-xs leading-5 text-danger">{error}</Text>
          <Button
            className="ml-2 h-8 px-3"
            onPress={() => void refresh()}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </View>
      )}

      <View className="h-7 flex-row items-center border-b border-separator bg-surface-secondary px-3">
        <Text className="min-w-0 flex-1 font-mono text-[9px] font-medium text-muted">KEY</Text>
        <Text className="w-20 text-right font-mono text-[9px] font-medium text-muted">VALUE</Text>
      </View>

      <FlatList
        contentContainerClassName="pb-safe"
        data={filteredEntries}
        keyExtractor={(entry) => entry.key}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View className="items-center px-8 py-12">
            <Text className="text-sm font-semibold text-foreground">
              {loading
                ? 'Loading storage…'
                : entries.length === 0
                  ? 'Storage is empty'
                  : 'No matching entries'}
            </Text>
            {!loading && (
              <Text className="mt-1 max-w-72 text-center text-xs leading-5 text-muted">
                {entries.length === 0
                  ? 'Values written by the connected storage adapter will appear here.'
                  : 'Try a different key or value.'}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const expanded = expandedKey === item.key;
          const dirty = draftValue !== (item.value ?? '');
          return (
            <View className="border-b border-separator bg-background">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                className="min-h-14 flex-row items-center px-3 py-2 active:bg-surface-secondary"
                onPress={() => expand(item)}
              >
                <View className="min-w-0 flex-1 pr-3">
                  <Text
                    className="font-mono text-xs font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {item.key}
                  </Text>
                  <Text className="mt-1 text-[10px] leading-4 text-muted" numberOfLines={1}>
                    {formatPreview(item.value)}
                  </Text>
                </View>
                {expanded ? (
                  <ChevronDown color={muted} size={16} />
                ) : (
                  <ChevronRight color={muted} size={16} />
                )}
              </Pressable>

              {expanded && (
                <View className="border-t border-separator bg-surface-secondary px-3 pb-3 pt-2">
                  <View className="mb-2 flex-row items-center">
                    <Text className="min-w-0 flex-1 font-mono text-[10px] text-muted" selectable>
                      {item.key}
                    </Text>
                    <InspectorIconButton
                      label="Copy storage key"
                      onPress={() => copy(`key:${item.key}`, item.key)}
                    >
                      {copiedKey === `key:${item.key}` ? (
                        <Check color={link} size={14} />
                      ) : (
                        <Copy color={muted} size={14} />
                      )}
                    </InspectorIconButton>
                    <InspectorIconButton
                      label="Copy storage value"
                      onPress={() => copy(`value:${item.key}`, draftValue)}
                    >
                      {copiedKey === `value:${item.key}` ? (
                        <Check color={link} size={14} />
                      ) : (
                        <Copy color={muted} size={14} />
                      )}
                    </InspectorIconButton>
                  </View>
                  <TextInput
                    accessibilityLabel={`Storage value for ${item.key}`}
                    className="min-h-28 rounded-md border border-field-border bg-background p-3 font-mono text-[11px] leading-5 text-foreground"
                    multiline
                    onChangeText={setDraftValue}
                    textAlignVertical="top"
                    value={draftValue}
                  />
                  <View className="mt-2 flex-row items-center justify-end gap-2">
                    <Button
                      accessibilityLabel={`Delete ${item.key}`}
                      className="h-8 px-3"
                      isDisabled={saving}
                      onPress={() => confirmRemove(item.key)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 color={danger} size={14} />
                      <Button.Label className="text-xs text-danger">Delete</Button.Label>
                    </Button>
                    <Button
                      accessibilityLabel={`Save ${item.key}`}
                      className="h-8 px-3"
                      isDisabled={!dirty || saving}
                      onPress={() => void save(item.key)}
                      size="sm"
                      variant="primary"
                    >
                      <Save color={accentForeground} size={14} />
                      <Button.Label className="text-xs">{saving ? 'Saving…' : 'Save'}</Button.Label>
                    </Button>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default StoragePanel;

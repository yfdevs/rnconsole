import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Button } from 'heroui-native/button';
import type NetworkRequestInfo from '../../core/NetworkRequestInfo';
import type { NetworkRequestInfoRow } from '../../core/types';
import ResultItem from './ResultItem';
import NetworkToolbar from './NetworkToolbar';
import { useAppContext } from './AppContext';

interface Props {
  requestsInfo: NetworkRequestInfoRow[];
  onPressItem: (item: NetworkRequestInfo['id']) => void;
  compact: boolean;
  maxRows: number;
  paused: boolean;
  onTogglePause: () => void;
  onClear: () => void;
  onExport: () => void;
  onClose?: () => void;
  embedded?: boolean;
}

const RequestList: React.FC<Props> = ({
  requestsInfo,
  onPressItem,
  compact,
  maxRows,
  paused,
  onTogglePause,
  onClear,
  onExport,
  onClose,
  embedded = false,
}) => {
  const { search, filter, filterActive, dispatch } = useAppContext();
  const lcSearch = search.toLowerCase().trim();

  const filteredRequests = useMemo(
    () =>
      requestsInfo
        .filter((request) => {
          const searchMatches =
            !lcSearch ||
            request.url.toLowerCase().includes(lcSearch) ||
            request.gqlOperation?.toLowerCase().includes(lcSearch);
          const methodMatches =
            (filter.methods?.size ?? 0) === 0 || filter.methods?.has(request.method);
          const statusMatches = filter.status
            ? request.status === filter.status
            : filter.statusErrors
              ? request.status >= 400
              : true;

          return searchMatches && methodMatches && statusMatches;
        })
        .slice(0, maxRows),
    [requestsInfo, lcSearch, filter, maxRows]
  );

  return (
    <View className="flex-1 bg-background">
      <NetworkToolbar
        onClear={onClear}
        onClose={onClose}
        onExport={onExport}
        onTogglePause={onTogglePause}
        paused={paused}
        requestCount={requestsInfo.length}
        visibleCount={filteredRequests.length}
        embedded={embedded}
      />
      {paused && (
        <View className="border-b border-separator bg-surface-secondary px-3 py-1.5">
          <Text className="text-center text-[11px] font-medium text-foreground">
            Recording paused · new requests are held
          </Text>
        </View>
      )}
      <View className="h-7 flex-row items-center border-b border-separator bg-surface-secondary px-3">
        <Text className="w-12 font-mono text-[9px] font-medium text-muted">METHOD</Text>
        <Text className="min-w-0 flex-1 font-mono text-[9px] font-medium text-muted">NAME</Text>
        <Text className="w-14 text-right font-mono text-[9px] font-medium text-muted">STATUS</Text>
        <Text className="w-14 text-right font-mono text-[9px] font-medium text-muted">TIME</Text>
      </View>
      <FlatList
        ListEmptyComponent={
          <View className="items-center px-8 py-12">
            <Text className="text-sm font-semibold text-foreground">
              {requestsInfo.length === 0 ? 'No requests yet' : 'No matching requests'}
            </Text>
            <Text className="max-w-72 text-center text-xs leading-5 text-muted">
              {requestsInfo.length === 0
                ? 'Use the app normally. Captured requests will appear in this table.'
                : 'Try a different URL, method, or status filter.'}
            </Text>
            {requestsInfo.length > 0 && (filterActive || search) && (
              <Button
                className="mt-3 h-8 rounded-md px-3"
                onPress={() => {
                  dispatch({ type: 'SET_SEARCH', payload: '' });
                  dispatch({ type: 'CLEAR_FILTER' });
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
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        data={filteredRequests}
        renderItem={({ item }) => (
          <ResultItem request={item} onPress={() => onPressItem(item.id)} compact={compact} />
        )}
      />
    </View>
  );
};

export default RequestList;

import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { Chip } from 'heroui-native/chip';
import type { NetworkRequestInfoRow } from '../../core/types';
import { cn } from '../../utils/cn';

interface Props {
  request: NetworkRequestInfoRow;
  onPress?(): void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  compact?: boolean;
}

const getUrlParts = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = `${parsed.pathname}${parsed.search}`;
    return { host: parsed.host, name: path === '/' ? parsed.host : path };
  } catch {
    return { host: '', name: url };
  }
};

const formatDuration = (duration: number) => {
  if (duration <= 0) return 'Pending';
  if (duration >= 1000) return `${(duration / 1000).toFixed(2)} s`;
  return `${duration} ms`;
};

const statusColor = (status: number, duration: number): 'default' | 'warning' | 'danger' => {
  if (status >= 500 || (status <= 0 && duration > 0)) return 'danger';
  if (status >= 400) return 'warning';
  return 'default';
};

const ResultItem: React.FC<Props> = ({ style, className, request, onPress, compact = false }) => {
  const status = request.status > 0 ? request.status : request.duration > 0 ? 'Failed' : 'Pending';
  const { host, name } = getUrlParts(request.url);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      className={cn(
        'flex-row items-center border-b border-separator bg-background px-3 active:bg-surface-secondary',
        compact ? 'min-h-11 py-1.5' : 'min-h-14 py-2',
        className
      )}
      disabled={!onPress}
      onPress={onPress}
      style={style}
    >
      <Text className="w-12 font-mono text-[10px] font-medium text-muted">{request.method}</Text>

      <View className="min-w-0 flex-1 pr-2">
        <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
          {request.gqlOperation ?? name}
        </Text>
        <Text className="mt-0.5 text-[10px] text-muted" numberOfLines={1}>
          {host || request.url}
          {request.gqlOperation ? ' · GraphQL' : ''}
        </Text>
      </View>

      <View className="w-14 items-end">
        <Chip
          accessibilityLabel={`Response status ${status}`}
          animation="disable-all"
          className="h-6 min-w-10 rounded px-1.5"
          color={statusColor(request.status, request.duration)}
          size="sm"
          variant="soft"
        >
          <Chip.Label className="font-mono text-[10px] font-semibold">{status}</Chip.Label>
        </Chip>
      </View>
      <View className="w-14 items-end">
        <Text className="font-mono text-[10px] text-muted">{formatDuration(request.duration)}</Text>
      </View>
    </Pressable>
  );
};

export default ResultItem;

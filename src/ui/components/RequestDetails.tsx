import React, { useEffect, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { Chip } from 'heroui-native/chip';
import { useThemeColor } from 'heroui-native/hooks';
import { Tabs } from 'heroui-native/tabs';
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import Braces from 'lucide-react-native/icons/braces';
import Share2 from 'lucide-react-native/icons/share-2';
import type NetworkRequestInfo from '../../core/NetworkRequestInfo';
import { cn } from '../../utils/cn';

interface Props {
  request: NetworkRequestInfo;
  onClose(): void;
}

type Tab = 'headers' | 'payload' | 'response' | 'timing';

const tabs: Array<{ label: string; value: Tab }> = [
  { label: 'Headers', value: 'headers' },
  { label: 'Payload', value: 'payload' },
  { label: 'Response', value: 'response' },
  { label: 'Timing', value: 'timing' },
];

const getUrlParts = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.host,
      path: `${parsed.pathname}${parsed.search}` || '/',
    };
  } catch {
    return { host: '', path: url };
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

const formatBytes = (size: number) => {
  if (!size) return '—';
  if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${size} B`;
};

const EmptyValue = ({ children }: { children: string }) => (
  <View className="items-center px-6 py-6">
    <Text className="text-center text-sm font-medium text-foreground">Nothing to show</Text>
    <Text className="mt-1 text-center text-xs leading-5 text-muted">{children}</Text>
  </View>
);

const SectionHeader = ({ title, count }: { title: string; count?: number }) => (
  <View className="h-8 flex-row items-center border-b border-separator bg-surface-secondary px-4">
    <Text className="text-xs font-semibold text-foreground">{title}</Text>
    {count !== undefined && <Text className="ml-2 font-mono text-[10px] text-muted">{count}</Text>}
  </View>
);

const HeaderRows = ({ values }: { values?: Record<string, unknown> }) => {
  const entries = Object.entries(values ?? {});
  if (!entries.length) return <EmptyValue>No headers were recorded for this request.</EmptyValue>;

  return (
    <View className="border-b border-separator bg-background">
      {entries.map(([name, value], index) => (
        <View
          className={cn(
            'flex-row items-start px-4 py-2',
            index < entries.length - 1 && 'border-b border-separator'
          )}
          key={name}
        >
          <Text
            className="w-2/5 pr-3 font-mono text-[10px] font-semibold leading-4 text-muted"
            selectable
          >
            {name}
          </Text>
          <Text className="min-w-0 flex-1 text-xs leading-4 text-foreground" selectable>
            {String(value)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const CodePanel = ({ title, children }: { title: string; children: string }) => (
  <View className="border-b border-separator bg-background">
    <View className="border-b border-separator px-4 py-2">
      <Text className="font-mono text-[10px] font-medium text-muted">{title}</Text>
    </View>
    <ScrollView horizontal nestedScrollEnabled>
      <Text className="p-4 font-mono text-[11px] leading-5 text-foreground" selectable>
        {children}
      </Text>
    </ScrollView>
  </View>
);

const Stat = ({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <View className="min-w-0 flex-1 px-4 py-2.5">
    <Text className="text-[10px] font-medium text-muted">{label}</Text>
    <Text
      className={cn('mt-1 font-mono text-xs font-semibold text-foreground', valueClass)}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const RequestDetails: React.FC<Props> = ({ request, onClose }) => {
  const [responseBody, setResponseBody] = useState('Loading response…');
  const [tab, setTab] = useState<Tab>('headers');
  const [foreground, link] = useThemeColor(['foreground', 'link']);
  const { host, path } = getUrlParts(request.url);

  useEffect(() => {
    let active = true;
    void request.getResponseBody().then((body) => {
      if (active) setResponseBody(body);
    });
    return () => {
      active = false;
    };
  }, [request]);

  const requestBody = request.getRequestBody(!!request.gqlOperation);
  const status =
    request.status > 0 ? `${request.status}` : request.duration > 0 ? 'Failed' : 'Pending';

  const fullRequest = () => {
    let response: unknown = responseBody;
    try {
      response = JSON.parse(responseBody);
    } catch {
      // Keep the original text response.
    }
    return JSON.stringify({ ...request, response, duration: request.duration }, null, 2);
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="border-b border-separator bg-background px-2 pb-2 pt-1">
        <View className="flex-row items-center">
          <Button
            accessibilityLabel="Back to request list"
            className="h-8 w-8"
            isIconOnly
            onPress={onClose}
            size="sm"
            variant="ghost"
          >
            <ArrowLeft color={foreground} size={18} />
          </Button>
          <View className="min-w-0 flex-1 px-2">
            <Text className="text-[13px] font-semibold text-foreground" numberOfLines={1}>
              {path}
            </Text>
            <Text className="mt-0.5 text-[10px] text-muted" numberOfLines={1}>
              {host || request.url}
            </Text>
          </View>
          <Button
            accessibilityLabel="Share request"
            className="h-8 w-8"
            isIconOnly
            onPress={() => Share.share({ message: fullRequest() })}
            size="sm"
            variant="ghost"
          >
            <Share2 color={link} size={16} />
          </Button>
        </View>
        <View className="mt-1 flex-row items-center px-10">
          <Chip
            animation="disable-all"
            className="h-6 rounded px-1.5"
            color="default"
            size="sm"
            variant="tertiary"
          >
            <Chip.Label className="font-mono text-[10px] font-semibold">
              {request.method}
            </Chip.Label>
          </Chip>
          <Chip
            animation="disable-all"
            className="ml-1.5 h-6 rounded px-1.5"
            color={statusColor(request.status, request.duration)}
            size="sm"
            variant="soft"
          >
            <Chip.Label className="text-[10px] font-semibold">{status}</Chip.Label>
          </Chip>
          <Text className="ml-2 text-[11px] text-muted">{formatDuration(request.duration)}</Text>
          <Text className="ml-2 min-w-0 flex-1 text-[11px] text-muted" numberOfLines={1}>
            {request.responseContentType || 'Unknown type'}
          </Text>
        </View>
      </View>

      <Tabs
        className="flex-1 gap-0"
        onValueChange={(value) => setTab(value as Tab)}
        value={tab}
        variant="secondary"
      >
        <Tabs.List
          background={null}
          className="h-9 flex-row border-b border-separator bg-background px-2"
        >
          <Tabs.Indicator />
          {tabs.map((item) => (
            <Tabs.Trigger className="h-9 flex-1" key={item.value} value={item.value}>
              <Tabs.Label className="text-[11px]">{item.label}</Tabs.Label>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content className="flex-1" value="headers">
          <ScrollView className="flex-1" contentContainerClassName="pb-safe-offset-4">
            <SectionHeader title="Overview" />
            <View className="border-b border-separator bg-background">
              <View className="flex-row px-4 py-2.5">
                <Text className="w-24 font-mono text-[10px] font-medium text-muted">
                  Request URL
                </Text>
                <Text className="min-w-0 flex-1 text-xs leading-4 text-foreground" selectable>
                  {request.url}
                </Text>
              </View>
              <View className="flex-row border-t border-separator">
                <Stat label="Method" value={request.method} />
                <View className="w-px bg-separator" />
                <Stat label="Status" value={status} />
                <View className="w-px bg-separator" />
                <Stat label="Duration" value={formatDuration(request.duration)} />
              </View>
            </View>

            <SectionHeader
              title="Request headers"
              count={Object.keys(request.requestHeaders).length}
            />
            <HeaderRows values={request.requestHeaders} />

            <SectionHeader
              title="Response headers"
              count={Object.keys(request.responseHeaders).length}
            />
            <HeaderRows values={request.responseHeaders} />
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content className="flex-1" value="payload">
          <ScrollView className="flex-1" contentContainerClassName="pb-safe-offset-4">
            <SectionHeader title="Request payload" />
            {requestBody ? (
              <CodePanel title="Body">{requestBody}</CodePanel>
            ) : (
              <EmptyValue>This request did not include a body.</EmptyValue>
            )}
            <SectionHeader title="Reproduce request" />
            <CodePanel title="cURL">{request.curlRequest}</CodePanel>
            <View className="items-start px-4 pt-3">
              <Button
                className="h-9 rounded-md px-3"
                onPress={() => Share.share({ message: request.curlRequest })}
                size="sm"
                variant="outline"
              >
                <Braces color={link} size={15} />
                <Button.Label className="text-xs">Share cURL</Button.Label>
              </Button>
            </View>
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content className="flex-1" value="response">
          <ScrollView className="flex-1" contentContainerClassName="pb-safe-offset-4">
            <SectionHeader title="Response body" />
            {responseBody ? (
              <CodePanel title={request.responseContentType || 'Response'}>
                {responseBody}
              </CodePanel>
            ) : (
              <EmptyValue>The server returned an empty response body.</EmptyValue>
            )}
          </ScrollView>
        </Tabs.Content>

        <Tabs.Content className="flex-1" value="timing">
          <ScrollView className="flex-1" contentContainerClassName="pb-safe-offset-4">
            <SectionHeader title="Request timing" />
            <View className="border-b border-separator bg-background">
              <View className="flex-row">
                <Stat label="Duration" value={formatDuration(request.duration)} />
                <View className="w-px bg-separator" />
                <Stat label="Transfer size" value={formatBytes(request.responseSize)} />
              </View>
              <View className="flex-row border-t border-separator">
                <Stat label="Timeout" value={request.timeout ? `${request.timeout} ms` : '—'} />
                <View className="w-px bg-separator" />
                <Stat
                  label="Started"
                  value={request.startTime ? new Date(request.startTime).toLocaleTimeString() : '—'}
                />
              </View>
            </View>
            <Text className="mx-4 mt-3 text-xs leading-5 text-muted">
              Detailed DNS, connection, and server timing are not exposed by React Native
              XMLHttpRequest.
            </Text>
          </ScrollView>
        </Tabs.Content>
      </Tabs>
    </View>
  );
};

export default RequestDetails;

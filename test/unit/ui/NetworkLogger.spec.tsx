import React from 'react';

import { act, fireEvent, render } from '@testing-library/react-native';
import NetworkLogger, { NetworkLoggerProps } from '../../../src/ui/components/NetworkLogger';
import logger from '../../../src/core/loggerSingleton';
import NetworkRequestInfo from '../../../src/core/NetworkRequestInfo';

vi.mock('../../../src/core/loggerSingleton', () => ({
  default: {
    isPaused: false,
    enabled: true,
    setCallback: vi.fn(),
    clearRequests: vi.fn(),
    onPausedChange: vi.fn(),
    getRequests: vi.fn().mockReturnValue([]),
    enableXHRInterception: vi.fn(),
    disableXHRInterception: vi.fn(),
  },
}));
vi.mock('../../../src/core/consoleLoggerSingleton', () => ({
  default: {
    isPaused: false,
    enabled: true,
    setCallback: vi.fn(),
    clearEntries: vi.fn(),
    onPausedChange: vi.fn(),
    getEntries: vi.fn().mockReturnValue([]),
    enableInterception: vi.fn(),
    disableInterception: vi.fn(),
  },
}));
vi.mock('../../../src/core/XHRInterceptor', () => ({
  default: {
    isInterceptorEnabled: vi.fn(),
    setOpenCallback: vi.fn(),
    setRequestHeaderCallback: vi.fn(),
    setSendCallback: vi.fn(),
    setHeaderReceivedCallback: vi.fn(),
    setResponseCallback: vi.fn(),
    enableInterception: vi.fn(),
  },
}));

const MyNetworkLogger = (props: NetworkLoggerProps) => {
  return <NetworkLogger {...props} />;
};

describe('max rows', () => {
  it('should stop adding new rows once maxRows is reached', () => {
    const requests = [] as NetworkRequestInfo[];
    const spyOnLoggerSetCallback = vi.spyOn(logger, 'setCallback');
    const emitCallback = vi.fn();
    spyOnLoggerSetCallback.mockImplementation((callback) => {
      return emitCallback.mockImplementation((id: number) => {
        requests.unshift(
          new NetworkRequestInfo(`${id}`, 'XMLHttpRequest', 'POST', `http://example.com/${id}`)
        );
        return callback(requests);
      });
    });

    const { queryAllByText, queryByText } = render(<MyNetworkLogger maxRows={2} />);

    act(() => {
      emitCallback(1);
    });

    expect(queryAllByText(/example\.com/i)).toHaveLength(1);

    act(() => {
      emitCallback(2);
    });

    expect(queryAllByText(/example\.com/i)).toHaveLength(2);

    act(() => {
      emitCallback(3);
    });

    expect(queryAllByText(/example\.com/i)).not.toHaveLength(3);
    expect(queryByText(/^\/3$/i)).toBeTruthy();
    expect(queryByText(/^\/2$/i)).toBeTruthy();
    expect(queryByText(/^\/1$/i)).toBeFalsy();

    spyOnLoggerSetCallback.mockRestore();
  });
});

describe('options', () => {
  it('should toggle the display of the paused banner when paused', async () => {
    const spyOnLoggerPauseRequests = vi.spyOn(logger, 'onPausedChange');
    const { queryByText, getByTestId, unmount } = render(<MyNetworkLogger />);

    fireEvent.press(getByTestId('toggle-recording'));

    expect(queryByText(/^recording paused/i)).toBeTruthy();

    expect(spyOnLoggerPauseRequests).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('toggle-recording'));

    expect(queryByText(/^recording paused/i)).toBeFalsy();

    spyOnLoggerPauseRequests.mockRestore();

    unmount();
  });

  it('should clear the logs on demand', async () => {
    const spyOnLoggerClearRequests = vi
      .spyOn(logger, 'clearRequests')
      .mockImplementationOnce(() => null);

    const { getByTestId, unmount } = render(<MyNetworkLogger />);
    expect(spyOnLoggerClearRequests).toHaveBeenCalledTimes(0);

    fireEvent.press(getByTestId('clear-logs'));

    expect(spyOnLoggerClearRequests).toHaveBeenCalledTimes(1);

    spyOnLoggerClearRequests.mockRestore();

    unmount();
  });
});

describe('regular vs compact row', () => {
  it.each([true, false])('should render row details when compact is %p', (compact) => {
    const requests = [] as NetworkRequestInfo[];
    const spyOnLoggerSetCallback = vi.spyOn(logger, 'setCallback');
    const emitCallback = vi.fn();
    spyOnLoggerSetCallback.mockImplementation((callback) => {
      return emitCallback.mockImplementation((id: number) => {
        if (id !== 1) {
          const request = new NetworkRequestInfo(
            `${id}`,
            'XMLHttpRequest',
            'GET',
            `http://example.com/${id}`
          );
          requests.unshift(request);
          return callback(requests);
        }
        const request = new NetworkRequestInfo(
          '1',
          'XMLHttpRequest',
          'POST',
          'http://example.com/1'
        );
        request.startTime = new Date('2000-01-01T12:34:00.000Z').getTime();
        request.endTime = new Date('2000-01-01T12:34:56.789Z').getTime();
        request.status = 200;
        requests.unshift(request);
        return callback(requests);
      });
    });

    const { getByText } = render(<MyNetworkLogger compact={compact} />);

    act(() => {
      emitCallback(1);
    });

    const method = getByText(/^post$/i);
    expect(method).toBeTruthy();

    const status = getByText(/^200$/i);
    expect(status).toBeTruthy();
    expect(getByText(/^56.79 s$/i)).toBeTruthy();

    spyOnLoggerSetCallback.mockRestore();
  });
});

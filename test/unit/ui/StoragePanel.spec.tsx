import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import type { StorageAdapter } from '../../../src/core/types';
import StoragePanel from '../../../src/ui/components/StoragePanel';

const flush = () => act(async () => Promise.resolve());

const createStorage = (): StorageAdapter => ({
  getAllKeys: vi.fn().mockResolvedValue(['session', 'feature-flags']),
  getItem: vi.fn(async (key: string) =>
    key === 'session' ? 'active' : JSON.stringify({ inspector: true })
  ),
  setItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
});

describe('StoragePanel', () => {
  it('loads and displays storage entries', async () => {
    const storage = createStorage();
    const onCountChange = vi.fn();
    const view = render(<StoragePanel onCountChange={onCountChange} storage={storage} />);

    await flush();

    expect(view.getByText('feature-flags')).toBeTruthy();
    expect(view.getByText('session')).toBeTruthy();
    expect(onCountChange).toHaveBeenCalledWith(2);
  });

  it('edits an expanded storage value', async () => {
    const storage = createStorage();
    const view = render(<StoragePanel storage={storage} />);
    await flush();

    fireEvent.press(view.getByText('session'));
    const input = view.getByA11yLabel('Storage value for session');
    act(() => input.props.onChangeText('expired'));
    fireEvent.press(view.getByA11yLabel('Save session'));
    await flush();

    expect(storage.setItem).toHaveBeenCalledWith('session', 'expired');
  });

  it('requires confirmation before deleting an entry', async () => {
    const storage = createStorage();
    const view = render(<StoragePanel storage={storage} />);
    await flush();

    fireEvent.press(view.getByText('session'));
    fireEvent.press(view.getByA11yLabel('Delete session'));

    expect(Alert.alert).toHaveBeenCalledOnce();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
});

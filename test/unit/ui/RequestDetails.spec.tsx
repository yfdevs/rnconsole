import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { fireEvent, render } from '@testing-library/react-native';
import NetworkRequestInfo from '../../../src/core/NetworkRequestInfo';
import RequestDetails from '../../../src/ui/components/RequestDetails';

describe('RequestDetails payload', () => {
  it('shows query parameters and form data in separate sections', () => {
    const request = new NetworkRequestInfo(
      '1',
      'XMLHttpRequest',
      'POST',
      'https://example.com/items?search=hello&tag=one&tag=two'
    );
    request.requestBodyType = 'form-data';
    request.dataSent = JSON.stringify({ name: 'rnconsole', enabled: true });
    vi.spyOn(request, 'getResponseBody').mockReturnValue(new Promise(() => {}));

    const view = render(<RequestDetails onClose={vi.fn()} request={request} />);

    expect(view.getByText('Query string parameters')).toBeTruthy();
    expect(view.getByText('hello')).toBeTruthy();
    expect(view.getByText('one\ntwo')).toBeTruthy();
    expect(view.getByText('Form data')).toBeTruthy();
    expect(view.getByText('rnconsole')).toBeTruthy();

    fireEvent.press(view.getByA11yLabel('Copy Query string parameters'));
    expect(Clipboard.setString).toHaveBeenCalledWith('search=hello&tag=one&tag=two');
  });
});

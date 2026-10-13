import type { ReactElement } from 'react';
import TestRenderer, { act, type ReactTestInstance } from 'react-test-renderer';

type TextMatch = string | RegExp;

const textContent = (node: ReactTestInstance): string =>
  node.children.map((child) => (typeof child === 'string' ? child : textContent(child))).join('');

const matches = (value: string, matcher: TextMatch) =>
  typeof matcher === 'string' ? value === matcher : matcher.test(value);

const queries = (root: ReactTestInstance) => {
  const queryAllByText = (matcher: TextMatch) => {
    const nodes = root.findAll((node) => String(node.type) === 'Text');
    return nodes.filter((node) => matches(textContent(node), matcher));
  };

  return {
    getByTestId: (testID: string) => root.findByProps({ testID }),
    queryByTestId: (testID: string) => root.findAllByProps({ testID })[0] ?? null,
    queryAllByText,
    getByText(matcher: TextMatch) {
      const result = queryAllByText(matcher)[0];
      if (!result) throw new Error(`Unable to find text: ${String(matcher)}`);
      return result;
    },
    queryByText: (matcher: TextMatch) => queryAllByText(matcher)[0] ?? null,
  };
};

export const render = (element: ReactElement) => {
  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(element);
  });

  return {
    ...queries(renderer.root),
    rerender(nextElement: ReactElement) {
      act(() => renderer.update(nextElement));
    },
    unmount() {
      act(() => renderer.unmount());
    },
  };
};

export const within = (root: ReactTestInstance) => queries(root);

export const fireEvent = {
  press(element: ReactTestInstance, ...args: unknown[]) {
    let target: ReactTestInstance | null = element;
    while (target && typeof target.props.onPress !== 'function') {
      target = target.parent;
    }
    act(() => {
      target?.props.onPress?.(...args);
    });
  },
};

export { act };

import React from 'react';
import { View } from 'react-native';

type GestureEndEvent = {
  translationX: number;
  velocityX: number;
};

type EndHandler = (event: GestureEndEvent) => void;

class MockPanGesture {
  endHandler?: EndHandler;

  hitSlop() {
    return this;
  }

  activeOffsetX() {
    return this;
  }

  failOffsetY() {
    return this;
  }

  onEnd(handler: EndHandler) {
    this.endHandler = handler;
    return this;
  }

  runOnJS() {
    return this;
  }
}

export const Gesture = {
  Pan: () => new MockPanGesture(),
};

const GestureTestView = View as React.ComponentType<
  Record<string, unknown> & { children?: React.ReactNode }
>;

export const GestureDetector = ({
  children,
  gesture,
}: {
  children: React.ReactNode;
  gesture: MockPanGesture;
}) => (
  <GestureTestView onGestureEnd={gesture.endHandler} testID="edge-swipe-back">
    {children}
  </GestureTestView>
);

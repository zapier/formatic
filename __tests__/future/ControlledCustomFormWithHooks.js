/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import {
  ExampleForm,
  value,
} from '@/demo/future/ControlledCustomFormWithHooks';

afterEach(cleanup);

describe('controlled custom form with hooks', () => {
  test('should fire onChange correctly', () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText, rerender } = render(
      <ExampleForm onChange={onChangeSpy} value={value} />
    );
    fireEvent.change(getByLabelText('First Name'), {
      target: { value: 'Joe' },
    });
    const newValue = onChangeSpy.mock.calls[0][0];
    expect(newValue).toEqual({
      firstName: 'Joe',
      lastName: '',
    });
    rerender(<ExampleForm onChange={onChangeSpy} value={newValue} />);
    fireEvent.change(getByLabelText('Last Name'), {
      target: { value: 'Foo' },
    });
    expect(onChangeSpy.mock.calls[1][0]).toEqual({
      firstName: 'Joe',
      lastName: 'Foo',
    });
  });
});

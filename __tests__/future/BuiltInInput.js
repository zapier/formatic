/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { ExampleForm, defaultValue } from '@/demo/future/BuiltInInput';

afterEach(cleanup);

describe('custom form with FieldContainer', () => {
  test('should fire onChange correctly', () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText } = render(
      <ExampleForm defaultValue={defaultValue} onChange={onChangeSpy} />
    );
    fireEvent.change(getByLabelText('First Name'), {
      target: { value: 'Joe' },
    });
    expect(onChangeSpy.mock.calls[0][0]).toEqual({
      firstName: 'Joe',
      lastName: '',
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: { value: 'Foo' },
    });
    expect(onChangeSpy.mock.calls[1][0]).toEqual({
      firstName: 'Joe',
      lastName: 'Foo',
    });
  });
});

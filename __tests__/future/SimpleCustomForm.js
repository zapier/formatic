/*global jest, describe, it, expect*/
import React from 'react';
import { render, fireEvent } from 'react-testing-library';

import { ExampleForm, defaultValue } from '@/demo/future/SimpleCustomForm';

describe('FormContainer', () => {
  it('should ', () => {
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

/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { ExampleForm, defaultValue } from '@/demo/future/IntegerField';

afterEach(cleanup);

describe('value coercion by input', () => {
  test('IntegerField should emit an integer value', () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText } = render(
      <ExampleForm defaultValue={defaultValue} onChange={onChangeSpy} />
    );
    fireEvent.change(getByLabelText('Age'), {
      target: { value: '50' },
    });
    expect(onChangeSpy.mock.calls[0][0]).toEqual({
      name: {
        firstName: '',
        lastName: '',
      },
      age: 50,
    });
  });
});

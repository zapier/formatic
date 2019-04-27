/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import {
  ExampleForm,
  defaultValue,
  CustomTextField,
} from '@/demo/future/AutoFields';

afterEach(cleanup);

describe('AutoFields', () => {
  test('renders fields from defaultValues', () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText } = render(
      <ExampleForm defaultValue={defaultValue} onChange={onChangeSpy} />
    );
    fireEvent.change(getByLabelText('First Name'), {
      target: { value: 'Joe' },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(1, {
      firstName: 'Joe',
      lastName: '',
      age: 0,
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: { value: 'Foo' },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(2, {
      firstName: 'Joe',
      lastName: 'Foo',
      age: 0,
    });

    fireEvent.change(getByLabelText('Age'), {
      target: { value: 32 },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(3, {
      firstName: 'Joe',
      lastName: 'Foo',
      age: 32,
    });
  });

  test('renders fields from values', () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText } = render(
      <ExampleForm onChange={onChangeSpy} value={defaultValue} />
    );
    fireEvent.change(getByLabelText('First Name'), {
      target: { value: 'Joe' },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(1, {
      firstName: 'Joe',
      lastName: '',
      age: 0,
    });
    fireEvent.change(getByLabelText('Last Name'), {
      target: { value: 'Foo' },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(2, {
      firstName: 'Joe',
      lastName: 'Foo',
      age: 0,
    });

    fireEvent.change(getByLabelText('Age'), {
      target: { value: 32 },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(3, {
      firstName: 'Joe',
      lastName: 'Foo',
      age: 32,
    });
  });

  test('component prop overrides default field components', () => {
    const onChangeSpy = jest.fn();
    const components = { string: CustomTextField };
    const { getByLabelText } = render(
      <ExampleForm
        components={components}
        onChange={onChangeSpy}
        value={defaultValue}
      />
    );

    fireEvent.change(getByLabelText('Custom First Name'), {
      target: { value: 'Joe' },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(1, {
      firstName: 'Joe',
      lastName: '',
      age: 0,
    });

    fireEvent.change(getByLabelText('Custom Last Name'), {
      target: { value: 'Foo' },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(2, {
      firstName: 'Joe',
      lastName: 'Foo',
      age: 0,
    });

    fireEvent.change(getByLabelText('Age'), {
      target: { value: 32 },
    });
    expect(onChangeSpy).toHaveBeenNthCalledWith(3, {
      firstName: 'Joe',
      lastName: 'Foo',
      age: 32,
    });
  });
});

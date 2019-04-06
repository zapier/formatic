/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { FormContainer, TextField } from '@/src/future';

afterEach(cleanup);

describe('built-in field with auto input ids', () => {
  test('should have auto-generated input ids', () => {
    const onChangeSpy = jest.fn();
    const defaultValue = {
      firstName: '',
      lastName: '',
    };

    const renderForm = () => (
      <FormContainer defaultValue={defaultValue} onChange={onChangeSpy}>
        <div data-testid="firstNameWrapper">
          <TextField fieldKey="firstName" label="First Name" />
        </div>
        <div data-testid="lastNameWrapper">
          <TextField fieldKey="lastName" label="Last Name" />
        </div>
      </FormContainer>
    );
    const { getByTestId, rerender } = render(renderForm());

    const firstNameInput = getByTestId('firstNameWrapper').querySelector(
      'input'
    );
    const lastNameInput = getByTestId('lastNameWrapper').querySelector('input');

    const firstNameId = firstNameInput.getAttribute('id');
    const lastNameId = lastNameInput.getAttribute('id');

    expect(firstNameId).toBeTruthy();
    expect(lastNameId).toBeTruthy();
    expect(firstNameId).not.toEqual(lastNameId);

    fireEvent.change(firstNameInput, {
      target: { value: 'Joe' },
    });
    expect(onChangeSpy.mock.calls[0][0]).toEqual({
      firstName: 'Joe',
      lastName: '',
    });
    fireEvent.change(lastNameInput, {
      target: { value: 'Foo' },
    });
    expect(onChangeSpy.mock.calls[1][0]).toEqual({
      firstName: 'Joe',
      lastName: 'Foo',
    });

    rerender(renderForm());

    // Ids should not change when rerendering.
    expect(firstNameId).toEqual(firstNameInput.getAttribute('id'));
    expect(lastNameId).toEqual(lastNameInput.getAttribute('id'));
  });
});

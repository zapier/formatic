/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { FormContainer, AutoFields, TextField, useField } from '@/src/future';

afterEach(cleanup);

describe('avoid rerendering', () => {
  const defaultValue = { firstName: '', lastName: '' };

  test('should avoid unnecessary rerendering with uncontrolled container', async () => {
    const renderSpy = jest.fn();
    function FirstName() {
      renderSpy('firstName');
      const { value } = useField('firstName');
      return <div>First Name: {value}</div>;
    }
    function LastName() {
      renderSpy('lastName');
      const { value } = useField('lastName');
      return <div>First Name: {value}</div>;
    }
    const { getByLabelText } = render(
      <FormContainer defaultValue={defaultValue}>
        <FirstName />
        <LastName />
        <TextField fieldKey="firstName" id="firstName" label="First Name" />
        <TextField fieldKey="lastName" id="lastName" label="Last Name" />
      </FormContainer>
    );
    fireEvent.change(getByLabelText('First Name'), {
      target: { value: 'Joe' },
    });
    expect(renderSpy.mock.calls).toEqual([
      ['firstName'],
      ['lastName'],
      ['firstName'],
    ]);
  });

  test('avoids unnecessary renders of AutoFields', () => {
    function CustomTextField({ fieldKey, label }) {
      const { value, onChangeTargetValue } = useField(fieldKey);
      const randomId = Math.random();
      return (
        <>
          <label htmlFor={randomId}>{label}</label>
          <input
            id={randomId}
            onChange={onChangeTargetValue}
            type="text"
            value={value}
          />
        </>
      );
    }

    const components = {
      string: CustomTextField,
    };

    const { getByLabelText } = render(
      <FormContainer defaultValue={defaultValue}>
        <AutoFields components={components} />
      </FormContainer>
    );

    const getInputId = id => getByLabelText(id).id;

    const intitialLastNameId = getInputId('Last Name');
    const initialFirstNameId = getInputId('First Name');

    fireEvent.change(getByLabelText('First Name'), {
      target: { value: 'Joe' },
    });

    expect(getInputId('First Name')).not.toBe(initialFirstNameId);
    expect(getInputId('Last Name')).toBe(intitialLastNameId);
  });
});

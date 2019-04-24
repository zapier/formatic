/*global jest, describe, test, expect, afterEach*/
import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import { FormContainer, TextField, useField } from '@/src/future';

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
});

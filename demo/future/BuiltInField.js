import React from 'react';

import { FormContainer, TextField } from '@/src/future';

export function ExampleForm({ defaultValue, onChange }) {
  return (
    <FormContainer defaultValue={defaultValue} onChange={onChange}>
      <TextField fieldKey="firstName" id="firstName" label="First Name" />
      <TextField fieldKey="lastName" id="lastName" label="Last Name" />
    </FormContainer>
  );
}

export const defaultValue = { firstName: '', lastName: '' };

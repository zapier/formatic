import React from 'react';

import { FormContainer, FieldContainer, TextField } from '@/src/future';

export function ExampleForm({ defaultValue, onChange }) {
  return (
    <FormContainer defaultValue={defaultValue} onChange={onChange}>
      <FieldContainer fieldKey="name">
        <TextField fieldKey="firstName" label="First Name" />
        <TextField fieldKey="lastName" label="Last Name" />
      </FieldContainer>
      <TextField fieldKey="username" label="Username" />
    </FormContainer>
  );
}

export const defaultValue = {
  name: { firstName: '', lastName: '' },
  username: '',
};
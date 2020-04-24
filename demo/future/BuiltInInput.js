import React from 'react';

import { FormContainer, TextInput } from '@/src/future';

function TextField({ fieldKey, label }) {
  return (
    <div>
      <div>
        <label htmlFor={fieldKey}>{label}</label>
      </div>
      <div>
        <TextInput fieldKey={fieldKey} id={fieldKey} />
      </div>
    </div>
  );
}

export function ExampleForm({ defaultValue, onChange }) {
  return (
    <FormContainer defaultValue={defaultValue} onChange={onChange}>
      <TextField fieldKey="firstName" label="First Name" />
      <TextField fieldKey="lastName" label="Last Name" />
    </FormContainer>
  );
}

export const defaultValue = { firstName: '', lastName: '' };
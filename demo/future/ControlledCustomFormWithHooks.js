import React from 'react';

import { FormContainer, useField } from '@/src/future';

function TextField({ fieldKey, label }) {
  const { value, onChangeTargetValue } = useField(fieldKey);
  return (
    <div>
      <div>
        <label htmlFor={fieldKey}>{label}</label>
      </div>
      <div>
        <input
          id={fieldKey}
          onChange={onChangeTargetValue}
          type="text"
          value={value}
        />
      </div>
    </div>
  );
}

export function ExampleForm({ value, onChange }) {
  return (
    <FormContainer onChange={onChange} value={value}>
      <TextField fieldKey="firstName" label="First Name" />
      <TextField fieldKey="lastName" label="Last Name" />
    </FormContainer>
  );
}

export const value = { firstName: '', lastName: '' };

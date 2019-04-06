import React from 'react';

import { FormContainer, FieldContainer } from '@/src/future';

function renderField({ fieldKey, label, value, onChangeTargetValue }) {
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

export function ExampleForm({ defaultValue, onChange }) {
  return (
    <FormContainer defaultValue={defaultValue} onChange={onChange}>
      <FieldContainer
        children={renderField}
        fieldKey="firstName"
        label="First Name"
      />
      <FieldContainer
        children={renderField}
        fieldKey="lastName"
        label="Last Name"
      />
    </FormContainer>
  );
}

export const defaultValue = { firstName: '', lastName: '' };

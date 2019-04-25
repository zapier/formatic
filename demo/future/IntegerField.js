import React from 'react';

import {
  FormContainer,
  FieldContainer,
  TextField,
  IntegerField,
} from '@/src/future';

const fields = [
  {
    key: 'age',
    type: 'Integer',
  },
];

export function ExampleForm({ defaultValue, onChange }) {
  return (
    <FormContainer
      defaultValue={defaultValue}
      fields={fields}
      onChange={onChange}
    >
      <FieldContainer fieldKey="name">
        <TextField fieldKey="firstName" label="First Name" />
        <TextField fieldKey="lastName" label="Last Name" />
      </FieldContainer>
      <IntegerField fieldKey="age" label="Age" />
    </FormContainer>
  );
}

export const defaultValue = {
  name: { firstName: '', lastName: '' },
  age: 0,
};

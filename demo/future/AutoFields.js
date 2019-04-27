import React from 'react';

import { FormContainer, useField } from '@/src/future';

export function CustomTextField({ fieldKey, label }) {
  const { value, onChangeTargetValue } = useField(fieldKey);
  return (
    <div>
      <div>
        <label htmlFor={fieldKey}>Custom {label}</label>
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

export function ExampleForm(props) {
  return (
    <FormContainer
      components={props.components}
      defaultValue={props.defaultValue}
      fields={props.fields}
      onChange={props.onChange}
      value={props.value}
    >
      {props.children}
    </FormContainer>
  );
}

export const defaultValue = { firstName: '', lastName: '', age: 0 };

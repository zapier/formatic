import React from 'react';

import { AutoFields, FormContainer } from '@/src/future';

export function ExampleForm(props) {
  return (
    <FormContainer
      defaultValue={props.defaultValue}
      fields={props.fields}
      onChange={props.onChange}
      value={props.value}
    >
      <AutoFields components={props.components} />
    </FormContainer>
  );
}

export const defaultValue = { firstName: '', lastName: '', age: 0 };

/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { FormContainer, TextField } from '@/src/future';

const styles = {
  Label: css({
    fontWeight: '600',
  }),
  TextInput: css({
    border: '2px solid black',
  }),
};

function renderTag(renderKey, Tag, props) {
  if (styles[renderKey]) {
    return <Tag {...props} css={styles[renderKey]} />;
  }
  return <Tag {...props} />;
}

function renderComponent(renderKey, Component, props) {
  if (renderKey === 'Field') {
    return <Component {...props} label={props.label.toUpperCase()} />;
  }
  return <Component {...props} />;
}

export function ExampleForm({ defaultValue, onChange }) {
  return (
    <FormContainer
      defaultValue={defaultValue}
      onChange={onChange}
      renderComponent={renderComponent}
      renderTag={renderTag}
    >
      <TextField fieldKey="firstName" id="firstName" label="First Name" />
      <TextField fieldKey="lastName" id="lastName" label="Last Name" />
    </FormContainer>
  );
}

export const defaultValue = { firstName: '', lastName: '' };

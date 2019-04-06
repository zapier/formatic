import React, { useState } from 'react';

function TextField({ fieldKey, label, value, onChangeField }) {
  return (
    <div>
      <div>
        <label htmlFor={fieldKey}>{label}</label>
      </div>
      <div>
        <input
          id={fieldKey}
          onChange={event => onChangeField(fieldKey, event.target.value)}
          type="text"
          value={value}
        />
      </div>
    </div>
  );
}

export function ExampleForm({ defaultValue, onChange }) {
  const [formState, setFormState] = useState(defaultValue);
  const onChangeField = (key, value) => {
    const newFormState = {
      ...formState,
      [key]: value,
    };
    setFormState(newFormState);
    onChange(newFormState);
  };
  return (
    <form>
      <TextField
        fieldKey="firstName"
        label="First Name"
        onChangeField={onChangeField}
        value={formState.firstName}
      />
      <TextField
        fieldKey="lastName"
        label="Last Name"
        onChangeField={onChangeField}
        value={formState.lastName}
      />
    </form>
  );
}

export const defaultValue = { firstName: '', lastName: '' };

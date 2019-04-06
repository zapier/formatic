import React, { createContext, useState, useContext } from 'react';

const FieldContext = createContext();

export function FormContainer({ defaultValue, onChange, children }) {
  const [formValue, setFormValue] = useState(defaultValue);
  function onSetFieldValue(key, value) {
    const newValue = {
      ...formValue,
      [key]: value,
    };
    setFormValue(newValue);
    onChange(newValue);
  }
  return (
    <FieldContext.Provider value={{ formValue, onSetFieldValue }}>
      {children}
    </FieldContext.Provider>
  );
}

export function useField(fieldKey) {
  const { formValue, onSetFieldValue } = useContext(FieldContext);
  function onChangeTargetValue({ target }) {
    onSetFieldValue(fieldKey, target.value);
  }
  return {
    value: formValue[fieldKey],
    onChangeTargetValue,
  };
}

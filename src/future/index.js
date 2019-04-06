import React, { createContext, useState, useContext } from 'react';

const FieldContext = createContext();

export function ControlledFormContainer({ value, onChange, children }) {
  function onSetFieldValue(fieldKey, fieldValue) {
    const newValue = {
      ...value,
      [fieldKey]: fieldValue,
    };
    onChange(newValue);
  }
  return (
    <FieldContext.Provider value={{ formValue: value, onSetFieldValue }}>
      {children}
    </FieldContext.Provider>
  );
}

export function UncontrolledFormContainer({
  defaultValue,
  onChange,
  children,
}) {
  const [formValue, setFormValue] = useState(defaultValue);
  function onSetFieldValue(fieldKey, fieldValue) {
    const newValue = {
      ...formValue,
      [fieldKey]: fieldValue,
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

export function FormContainer({ value, defaultValue, ...props }) {
  const [savedDefaultValue] = useState(defaultValue);
  const [isControlled] = useState(savedDefaultValue === undefined);
  if (isControlled) {
    return <ControlledFormContainer value={value} {...props} />;
  } else {
    return (
      <UncontrolledFormContainer defaultValue={savedDefaultValue} {...props} />
    );
  }
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

export function FieldContainer({ fieldKey, children, ...props }) {
  const { value, onChangeTargetValue } = useField(fieldKey);
  return typeof children === 'function'
    ? children({
        fieldKey,
        value,
        onChangeTargetValue,
        ...props,
      })
    : children;
}

export function TextInput({ id, fieldKey }) {
  const { value, onChangeTargetValue } = useField(fieldKey);
  return <input id={id} onChange={onChangeTargetValue} value={value} />;
}

export function TextField({ id, fieldKey, label }) {
  return (
    <div>
      <div>
        <label htmlFor={id}>{label}</label>
      </div>
      <div>
        <TextInput fieldKey={fieldKey} id={id} />
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';

import useField from '@/src/future/hooks/useField';

import { FieldContext, RenderContext } from '@/src/future/context';

import Component from '@/src/future/components/Component';
import Field from '@/src/future/components/Field';

import TextInput from '@/src/future/inputs/TextInput';

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

export function FormContainer({
  value,
  defaultValue,
  renderTag,
  renderComponent,
  ...props
}) {
  const [savedDefaultValue] = useState(defaultValue);
  const [isControlled] = useState(savedDefaultValue === undefined);
  // Keep context object pure.
  const renderContext = useMemo(() => ({ renderTag, renderComponent }), [
    renderTag,
    renderComponent,
  ]);
  return (
    <RenderContext.Provider value={renderContext}>
      {isControlled ? (
        <ControlledFormContainer value={value} {...props} />
      ) : (
        <UncontrolledFormContainer
          defaultValue={savedDefaultValue}
          {...props}
        />
      )}
    </RenderContext.Provider>
  );
}

export function FieldContainer({ fieldKey, children, ...props }) {
  const { value, onChange, onChangeTargetValue } = useField(fieldKey);
  if (typeof children === 'function') {
    return children({
      fieldKey,
      value,
      onChangeTargetValue,
      ...props,
    });
  }
  return (
    <ControlledFormContainer onChange={onChange} value={value}>
      {children}
    </ControlledFormContainer>
  );
}

function createField(fieldType, Input) {
  function FieldComponent(props) {
    return (
      <Component
        _component={Field}
        {...props}
        fieldType={fieldType}
        Input={Input}
      />
    );
  }
  FieldComponent.displayName = `${fieldType}Field`;
  return FieldComponent;
}

const TextField = createField('Text', TextInput);

export { TextField };

export { TextInput };

export { useField };

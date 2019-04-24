import React, { useState, useMemo } from 'react';

import {
  ReactiveValueContainer,
  useReactiveValue,
} from '@/src/future/ReactiveValue';
import useField from '@/src/future/hooks/useField';

import { RenderContext } from '@/src/future/context';

import Component from '@/src/future/components/Component';
import Field from '@/src/future/components/Field';

import TextInput from '@/src/future/inputs/TextInput';

export function FormContainer({
  value,
  defaultValue,
  renderTag,
  renderComponent,
  onChange,
  children,
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
      <ReactiveValueContainer
        onChange={onChange}
        value={isControlled ? value : savedDefaultValue}
      >
        {children}
      </ReactiveValueContainer>
    </RenderContext.Provider>
  );
}

export function FieldContainer({ fieldKey, children, ...props }) {
  const { value, setValue } = useReactiveValue(fieldKey);

  if (typeof children === 'function') {
    return children({
      fieldKey,
      value,
      onChangeTargetValue: event => setValue(event.target.value),
      onChange: setValue,
      ...props,
    });
  }

  return (
    <ReactiveValueContainer onChange={setValue} value={value}>
      {children}
    </ReactiveValueContainer>
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

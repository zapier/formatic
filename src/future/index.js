import React, { useState, useMemo } from 'react';

import {
  ReactiveValueContainer,
  ReactiveChildContainer,
  useReactiveValueAt,
} from '@/src/future/ReactiveValue';
import useField from '@/src/future/hooks/useField';

import { RenderContext } from '@/src/future/context';

export * from '@/src/future/builtin-fields';
export * from '@/src/future/inputs';

export function FormContainer({
  children,
  defaultValue,
  onChange,
  renderTag,
  renderComponent,
  value,
}) {
  const [savedDefaultValue] = useState(defaultValue);
  const [isControlled] = useState(savedDefaultValue === undefined);
  const normalizedValue = isControlled ? value : savedDefaultValue;
  // Keep context object pure.
  const renderContext = useMemo(
    () => ({ renderTag, renderComponent, initialValue: normalizedValue }),
    [renderTag, renderComponent]
  );
  return (
    <RenderContext.Provider value={renderContext}>
      <ReactiveValueContainer onChange={onChange} value={normalizedValue}>
        {children}
      </ReactiveValueContainer>
    </RenderContext.Provider>
  );
}

function RenderFieldContainer({ fieldKey, children, ...props }) {
  const { value, setValue } = useReactiveValueAt(fieldKey);

  return children({
    fieldKey,
    value,
    onChangeTargetValue: event => setValue(event.target.value),
    onChange: setValue,
    ...props,
  });
}

export function FieldContainer({ fieldKey, children, ...props }) {
  if (typeof children === 'function') {
    return (
      <RenderFieldContainer
        children={children}
        fieldKey={fieldKey}
        {...props}
      />
    );
  }

  return (
    <ReactiveChildContainer childKey={fieldKey}>
      {children}
    </ReactiveChildContainer>
  );
}

export { useField };

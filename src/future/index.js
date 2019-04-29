import React, { useState, useMemo } from 'react';

import {
  ReactiveValueContainer,
  useReactiveValue,
} from '@/src/future/ReactiveValue';
import useField from '@/src/future/hooks/useField';

import { RenderContext } from '@/src/future/context';

export * from '@/src/future/formatic-fields';
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

export { useField };

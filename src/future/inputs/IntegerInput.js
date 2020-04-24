import React from 'react';

import useField from '@/src/future/hooks/useField';
import Tag from '@/src/future/components/Tag';
import { createRenderWith } from '@/src/future/utils';

export default function IntegerInput({ id, fieldKey, fieldType = 'Text' }) {
  const { value, onChange } = useField(fieldKey);

  const renderWith = createRenderWith({
    fieldType,
  });

  function onChangeEvent({ target }) {
    if (target === '') {
      return onChange(target.value);
    }
    const parsedValue = parseInt(target.value);
    if (!isNaN(parsedValue)) {
      return onChange(parsedValue);
    }
    return onChange(target.value);
  }

  return (
    <Tag
      {...renderWith('input', 'IntegerInput')}
      id={id}
      onChange={onChangeEvent}
      value={value}
    />
  );
}

import React from 'react';

import useField from '@/src/future/hooks/useField';
import Tag from '@/src/future/components/Tag';
import { createRenderWith } from '@/src/future/utils';

export default function TextInput({ id, fieldKey, fieldType = 'Text' }) {
  const { value, onChangeTargetValue } = useField(fieldKey);

  const renderWith = createRenderWith({
    fieldType,
  });
  return (
    <Tag
      {...renderWith('input', 'TextInput')}
      id={id}
      onChange={onChangeTargetValue}
      value={value}
    />
  );
}

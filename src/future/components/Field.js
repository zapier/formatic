import React from 'react';

import useInputId from '@/src/future/hooks/useInputId';

import Component from '@/src/future/components/Component';
import Tag from '@/src/future/components/Tag';

import { createRenderWith } from '@/src/future/utils';

export default function Field({ id, fieldKey, label, fieldType, Input }) {
  const inputId = useInputId(id, fieldKey);

  const renderWith = createRenderWith({
    fieldType,
  });

  return (
    <Tag {...renderWith('div', 'Field')}>
      <Tag {...renderWith('div', 'LabelWrapper')}>
        <Tag {...renderWith('label', 'Label')} htmlFor={inputId}>
          {label}
        </Tag>
      </Tag>
      <Tag {...renderWith('div', 'InputWrapper')}>
        <Component
          _component={Input}
          fieldKey={fieldKey}
          fieldType={fieldType}
          id={inputId}
        />
      </Tag>
    </Tag>
  );
}

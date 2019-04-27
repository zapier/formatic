import React from 'react';
import Component from '@/src/future/components/Component';
import Field from '@/src/future/components/Field';
import TextInput from '@/src/future/inputs/TextInput';
import IntegerInput from '@/src/future/inputs/IntegerInput';
import createAutoFields from '@/src/future/formatic-fields/AutoFields';

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

export const TextField = createField('Text', TextInput);
export const IntegerField = createField('Text', IntegerInput);

export const AutoFields = createAutoFields({
  integer: IntegerField,
  number: IntegerField,
  text: TextField,
  string: TextField,
});

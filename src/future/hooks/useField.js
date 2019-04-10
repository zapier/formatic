import { useContext } from 'react';

import { FieldContext } from '@/src/future/context';

export default function useField(fieldKey) {
  const { formValue, onSetFieldValue } = useContext(FieldContext);
  function onChangeTargetValue({ target }) {
    onSetFieldValue(fieldKey, target.value);
  }
  function onChange(newFieldValue) {
    onSetFieldValue(fieldKey, newFieldValue);
  }
  return {
    value: formValue[fieldKey],
    onChangeTargetValue,
    onChange,
  };
}

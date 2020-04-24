import { useReactiveValueAt } from '@/src/future/ReactiveValue';

export default function useField(fieldKey) {
  const { value, setValue } = useReactiveValueAt(fieldKey);

  function onChangeTargetValue({ target }) {
    setValue(target.value);
  }

  return {
    value,
    onChangeTargetValue,
    onChange: setValue,
  };
}

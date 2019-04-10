import { useState } from 'react';

function createUniqueIdFn() {
  let id = 0;
  return function getUniqueId(prefix = 'id') {
    id++;
    return `${prefix}-${id}`;
  };
}

const getUniqueId = createUniqueIdFn();

export default function useInputId(id, fieldKey) {
  const [inputId] = useState(() => id || getUniqueId(fieldKey));
  return inputId;
}

import React, { useContext, useEffect, useRef, useState } from 'react';

function isObject(value) {
  return value != null && typeof value === 'object';
}

function getValueAt(key, value) {
  if (isObject(value)) {
    return value[key];
  }
  return undefined;
}

// Wrap a value so that we can subscribe to changes to specific properties of
// that value and ignore properties that don't change.
const createReactiveValue = defaultValue => {
  let currentValue = defaultValue;
  const listeners = [];
  const listenersByKey = {};

  function getValue() {
    return currentValue;
  }

  function getCurrentValueAt(key) {
    if (isObject(currentValue)) {
      return currentValue[key];
    }

    return undefined;
  }

  function notifyForKey(key, newValueAtKey) {
    listenersByKey[key].forEach(handler => {
      handler(newValueAtKey);
    });
  }

  // Set value at a key and notify all subscribers to that key and the root
  // value.
  function setValueAt(key, newValue) {
    if (getCurrentValueAt(key) !== newValue) {
      if (isObject(currentValue)) {
        currentValue = {
          ...currentValue,
          [key]: newValue,
        };
      }
      // Notify of actual value, which could potentially be different from
      // the desired value. For example, if the root value is not an object, or
      // it's a proxy. At that point, we're pretty much into unsupported
      // territory though, and the behavior is unknown.
      const trueNewValue = getCurrentValueAt(key);
      if (listenersByKey[key]) {
        notifyForKey(key, trueNewValue);
      }
      // Notify any root value subscribers.
      listeners.forEach(handler => {
        handler(currentValue);
      });
    }
  }

  // Set the root value. Don't notify root listeners, since we don't want to
  // cause a loop. But... if there are any listeners of properties, notify them
  // if those properties have changed.
  function setValue(newValue) {
    if (newValue !== currentValue) {
      const previousValue = currentValue;
      currentValue = newValue;
      for (const key in listenersByKey) {
        const newValueAtKey = getValueAt(key, newValue);
        if (getValueAt(key, previousValue) !== newValueAtKey) {
          notifyForKey(key, newValueAtKey);
        }
      }
    }
  }

  function subscribe(handler) {
    listeners.push(handler);
    return () => {
      const i = listeners.indexOf(handler);
      listeners.splice(i, 1);
    };
  }

  function subscribeAt(key, handler) {
    if (!(key in listenersByKey)) {
      listenersByKey[key] = [];
    }
    const listenersAtKey = listenersByKey[key];
    listenersAtKey.push(handler);
    return () => {
      const i = listenersAtKey.indexOf(handler);
      listenersAtKey.splice(i, 1);
      if (listenersAtKey.length === 0) {
        delete listenersByKey[key];
      }
    };
  }

  return {
    getValue,
    getValueAt: getCurrentValueAt,
    setValue,
    setValueAt,
    subscribe,
    subscribeAt,
  };
};

const ReactiveValueContext = React.createContext();

export function ReactiveValueContainer({ value, onChange, children }) {
  // We want to use a ref so that we can hold onto a single instance of our
  // value wrapper.
  const valueRef = useRef(null);
  // Initialize our wrapper once.
  if (valueRef.current === null) {
    valueRef.current = createReactiveValue(value);
  }
  // Any time we get a new value, set the wrapper's value to that value. The
  // wrapper will ignore equal values, so no worries of a loop here.
  useEffect(() => {
    valueRef.current.setValue(value);
  });
  // Any time our wrapper's value changes, kick off our onChange handler.
  useEffect(
    () => {
      return typeof onChange === 'function'
        ? valueRef.current.subscribe(onChange)
        : () => {};
    },
    [onChange]
  );
  return (
    <ReactiveValueContext.Provider value={valueRef.current}>
      {children}
    </ReactiveValueContext.Provider>
  );
}

export function useReactiveValue(key) {
  const context = useContext(ReactiveValueContext);
  const [value, setValue] = useState(() => context.getValueAt(key));
  useEffect(
    () => {
      // Subscribe to changes to the property and set our value in state when
      // that property changes.
      return context.subscribeAt(key, setValue);
    },
    [key]
  );
  function setValueInContext(newValue) {
    context.setValueAt(key, newValue);
  }
  return { value, setValue: setValueInContext };
}

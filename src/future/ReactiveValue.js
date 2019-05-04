import React, { useContext, useEffect, useRef, useState } from 'react';

function isObject(value) {
  return value != null && typeof value === 'object';
}

function getPropertyValue(key, value) {
  if (isObject(value)) {
    return value[key];
  }
  return undefined;
}

function getTypeName(value) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

class ReactiveValue {
  constructor(defaultValue, key, parent) {
    this.currentValue = defaultValue;
    this.listeners = [];
    this.key = key;
    this.parent = parent;
    this.children = {};
    this.refCount = 0;
    this.meta = null;
    this.hasMetaChanged = false;
    this.metaListeners = [];
  }

  getValueAt(key) {
    return getPropertyValue(key, this.currentValue);
  }

  getValue() {
    return this.currentValue;
  }

  // Get the property type of this value and the property types of its children.
  getMeta() {
    if (!this.meta) {
      this.meta = {
        type: getTypeName(this.currentValue),
        propertyTypes: isObject(this.currentValue)
          ? Object.keys(this.currentValue).reduce((result, key) => {
              result[key] = getTypeName(this.currentValue[key]);
              return result;
            }, {})
          : {},
      };
    }
    return this.meta;
  }

  updateMeta() {
    this.meta = null;
    this.hasMetaChanged = true;
    this.getMeta();
  }

  // Set property value and recurse up through parents.
  setValueAt(key, newValue) {
    if (newValue !== this.getValueAt(key)) {
      if (isObject(this.currentValue)) {
        this.currentValue = {
          ...this.currentValue,
          [key]: newValue,
        };
        if (this.parent) {
          this.parent.setValueAt(this.key, this.currentValue);
          // Make sure our parent is actually holding the new value. If not,
          // take the actual value from the parent.
          this.currentValue = this.parent.getValueAt(this.key);
        }
        if (
          this.meta &&
          this.meta.propertyTypes[key] !== getTypeName(newValue)
        ) {
          this.updateMeta();
        }
      }
    }
  }

  notifyUp(shouldNotifyParent = true) {
    // Notify listeners for this value.
    this.listeners.forEach(handler => {
      handler(this.currentValue);
    });
    if (this.hasMetaChanged) {
      this.metaListeners.forEach(handler => {
        handler(this.getMeta());
      });
      this.hasMetaChanged = false;
    }
    // And maybe parent values.
    if (this.parent && shouldNotifyParent) {
      this.parent.notifyUp();
    }
  }

  setValue(newValue, shouldNotifyParent = true) {
    // Ignore this if it's the same value.
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      if (this.parent && shouldNotifyParent) {
        this.parent.setValueAt(this.key, newValue);
        // Make sure our parent is actually holding the new value. If not,
        // take the actual value from the parent.
        this.currentValue = this.parent.getValueAt(this.key);
      }
      // Set our child values, making sure they don't call us back since we
      // already know.
      for (const key in this.children) {
        const child = this.children[key];
        child.setValue(this.getValueAt(key), false);
      }
      // Notify our subscribers and our parent's subscribers.
      this.notifyUp(shouldNotifyParent);
    }
  }

  subscribe(handler) {
    this.listeners.push(handler);
    return () => {
      const i = this.listeners.indexOf(handler);
      this.listeners.splice(i, 1);
    };
  }

  subscribeMeta(handler) {
    this.metaListeners.push(handler);
    return () => {
      const i = this.metaListeners.indexOf(handler);
      this.metaListeners.splice(i, 1);
    };
  }

  // Return child, creating it if necessary, with a zero reference count.
  getChild(key) {
    if (!this.children[key]) {
      this.children[key] = new ReactiveValue(this.getValueAt(key), key, this);
    }
    return this.children[key];
  }

  // Increment the reference count, and return a dispose function that will
  // decrement the reference count and throw away the child when the reference
  // count reaches zero.
  hold() {
    if (this.parent) {
      this.refCount++;
      return () => {
        this.refCount--;
        if (this.refCount === 0) {
          this.parent.releaseAt(this.key);
        }
      };
    }
    return () => {};
  }

  // Dispose of a child.
  releaseAt(key) {
    delete this.children[key];
  }
}

const ReactiveValueContext = React.createContext();

export function ReactiveValueContainer({ value, onChange, children }) {
  // We want to use a ref so that we can hold onto a single instance of our
  // value wrapper.
  const valueRef = useRef(null);
  // Initialize our wrapper once.
  if (valueRef.current === null) {
    valueRef.current = new ReactiveValue(value);
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

// Grabs a child and makes sure it gets disposed of when there are no more
// references to it.
function useChildReactiveValue(key) {
  const parentReactiveValue = useContext(ReactiveValueContext);
  const childReactiveValue = parentReactiveValue.getChild(key);
  useEffect(
    () => {
      return childReactiveValue.hold();
    },
    [key]
  );
  return childReactiveValue;
}

// Get the current value and a setValue function for a particular property.
export function useReactiveValueAt(key) {
  const childReactiveValue = useChildReactiveValue(key);
  const [value, setValue] = useState(() => childReactiveValue.getValue());
  useEffect(
    () => {
      // Subscribe to changes to the property and set our value in state when
      // that property changes.
      return childReactiveValue.subscribe(setValue);
    },
    [key]
  );
  function setValueInContext(newValue) {
    childReactiveValue.setValue(newValue);
  }
  return { value, setValue: setValueInContext };
}

// Get the current value and a setValue function for the current property (or
// root value).
export function useReactiveValue() {
  const reactiveValue = useContext(ReactiveValueContext);
  const [value, setValue] = useState(() => reactiveValue.getValue());
  useEffect(() => {
    // Subscribe to changes to the whoile value property and set our value in
    // state when that property changes.
    return reactiveValue.subscribe(setValue);
  }, []);
  function setValueInContext(newValue) {
    reactiveValue.setValue(newValue);
  }
  return { value, setValue: setValueInContext };
}

// Get the current property metadata.
export function useReactiveValueMeta() {
  const reactiveValue = useContext(ReactiveValueContext);
  const [meta, setMeta] = useState(() => reactiveValue.getMeta());
  useEffect(() => {
    return reactiveValue.subscribeMeta(setMeta);
  }, []);
  return meta;
}

// Nest into a child.
export function ReactiveChildContainer({ childKey, children }) {
  const childReactiveValue = useChildReactiveValue(childKey);
  return (
    <ReactiveValueContext.Provider value={childReactiveValue}>
      {children}
    </ReactiveValueContext.Provider>
  );
}

import React, { createContext, useState, useContext, useMemo } from 'react';

const FieldContext = createContext();
const RenderContext = createContext({});

export function ControlledFormContainer({ value, onChange, children }) {
  function onSetFieldValue(fieldKey, fieldValue) {
    const newValue = {
      ...value,
      [fieldKey]: fieldValue,
    };
    onChange(newValue);
  }
  return (
    <FieldContext.Provider value={{ formValue: value, onSetFieldValue }}>
      {children}
    </FieldContext.Provider>
  );
}

export function UncontrolledFormContainer({
  defaultValue,
  onChange,
  children,
}) {
  const [formValue, setFormValue] = useState(defaultValue);
  function onSetFieldValue(fieldKey, fieldValue) {
    const newValue = {
      ...formValue,
      [fieldKey]: fieldValue,
    };
    setFormValue(newValue);
    onChange(newValue);
  }
  return (
    <FieldContext.Provider value={{ formValue, onSetFieldValue }}>
      {children}
    </FieldContext.Provider>
  );
}

export function FormContainer({ value, defaultValue, renderTag, ...props }) {
  const [savedDefaultValue] = useState(defaultValue);
  const [isControlled] = useState(savedDefaultValue === undefined);
  // Keep context object pure.
  const renderContext = useMemo(() => ({ renderTag }), [renderTag]);
  return (
    <RenderContext.Provider value={renderContext}>
      {isControlled ? (
        <ControlledFormContainer value={value} {...props} />
      ) : (
        <UncontrolledFormContainer
          defaultValue={savedDefaultValue}
          {...props}
        />
      )}
    </RenderContext.Provider>
  );
}

export function useField(fieldKey) {
  const { formValue, onSetFieldValue } = useContext(FieldContext);
  function onChangeTargetValue({ target }) {
    onSetFieldValue(fieldKey, target.value);
  }
  return {
    value: formValue[fieldKey],
    onChangeTargetValue,
  };
}

export function FieldContainer({ fieldKey, children, ...props }) {
  const { value, onChangeTargetValue } = useField(fieldKey);
  return typeof children === 'function'
    ? children({
        fieldKey,
        value,
        onChangeTargetValue,
        ...props,
      })
    : children;
}

function createRenderWith(_meta) {
  return function renderWith(_tag, _key) {
    return {
      _tag,
      _key,
      _meta,
    };
  };
}

export function TextInput({ id, fieldKey, fieldType = 'Text' }) {
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

function createUniqueIdFn() {
  let id = 0;
  return function getUniqueId(prefix = 'id') {
    id++;
    return `${prefix}-${id}`;
  };
}

const getUniqueId = createUniqueIdFn();

function useInputId(id, fieldKey) {
  const [inputId] = useState(() => id || getUniqueId(fieldKey));
  return inputId;
}

export const Tag = React.forwardRef(function Tag(
  { _tag: RenderTag, _key, _meta, ...props },
  ref
) {
  const renderContext = useContext(RenderContext);
  if (!renderContext.renderTag) {
    return <RenderTag {...props} ref={ref} />;
  }
  return renderContext.renderTag(
    _key,
    RenderTag,
    {
      ...props,
      ref,
    },
    _meta
  );
});

export function Field({ id, fieldKey, label, fieldType, Input }) {
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
        <Input fieldKey={fieldKey} fieldType={fieldType} id={inputId} />
      </Tag>
    </Tag>
  );
}

export function TextField(props) {
  return <Field {...props} fieldType="Text" Input={TextInput} />;
}

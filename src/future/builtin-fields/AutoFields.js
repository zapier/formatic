import React, { useContext } from 'react';
import { RenderContext } from '@/src/future/context';
import { startCase } from '@/src/stringUtils';

const inferSchema = ([key, value]) => ({
  key,
  label: startCase(key),
  type: typeof value,
});

export default function createAutoFields(defaultFieldComponents) {
  return function AutoFields(props) {
    const { initialValue: formValues } = useContext(RenderContext);
    const schema = Object.entries(formValues).map(inferSchema);
    const components = { ...defaultFieldComponents, ...props.components };

    return schema.map(field => {
      const FieldComponent =
        components[field.type] || defaultFieldComponents.string;

      return (
        <FieldComponent
          fieldKey={field.key}
          id={field.key}
          key={`__autofield-${field.key}`}
          label={field.label}
        />
      );
    });
  };
}

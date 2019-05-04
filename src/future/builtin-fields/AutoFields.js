import React from 'react';
import { useReactiveValueMeta } from '@/src/future/ReactiveValue';
import { startCase } from '@/src/stringUtils';

const inferSchema = ({ key, type }) => ({
  key,
  label: startCase(key),
  type,
});

export default function createAutoFields(defaultFieldComponents) {
  return function AutoFields(props) {
    const meta = useReactiveValueMeta();
    const schema = Object.keys(meta.propertyTypes).map(key =>
      inferSchema({
        key,
        type: meta.propertyTypes[key],
      })
    );
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

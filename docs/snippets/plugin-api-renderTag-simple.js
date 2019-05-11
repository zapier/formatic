const plugin = config => {
  const { renderTag } = config;
  return {
    renderTag: (Tag, tagProps, metaProps, ...children) => {
      const { typeName, parentTypeName, elementName } = metaProps;
      // The `typeName` is the name of the component that is rendering this
      // element. `elementName` is the identifier for the specific tag.
      if (typeName === 'Password' && elementName === 'PasswordInput') {
        tagProps = {
          ...tagProps,
          style: { color: 'red' },
        };
      }
      // Nested children of a type have a `parentTypeName`.
      if (parentTypeName === 'Array' && elementName === 'RemoveItem') {
        tagProps = {
          ...tagProps,
          style: { color: 'red' },
        };
      }
      // Pass through other tags to the original renderTag method.
      return renderTag(Tag, tagProps, metaProps, ...children);
    },
  };
};
//CUT
console.info(plugin);
//CUT

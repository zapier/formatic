import cx from 'classnames';

const plugin = prevConfig => {
  const classes = {
    Field: ({ field }) => ({
      Field: true,
      'Field-IsReadOnly': prevConfig.fieldIsReadOnly(field),
    }),
  };

  const origRenderTag = prevConfig.renderTag;
  return {
    renderTag: (tagName, tagProps, metaProps) => {
      tagProps = {
        ...tagProps,
      };
      const typeName = metaProps.typeName || metaProps.parentTypeName;
      const { elementName } = metaProps;
      const fieldElementName = `${typeName}_${elementName}`;
      tagProps.className = cx(
        tagProps.className,
        fieldElementName,
        classes[typeName] && classes[typeName](metaProps),
        classes[elementName] && classes[elementName](metaProps),
        classes[fieldElementName] && classes[fieldElementName](metaProps)
      );
      return origRenderTag(tagName, tagProps, metaProps);
    },
  };
};

export default plugin;

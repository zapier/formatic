const plugin = prevConfig => {
  const origRenderTag = prevConfig.renderTag;
  return {
    renderTag: (tagName, tagProps, metaProps) => {
      tagProps = {
        ...tagProps,
      };
      const className = tagProps.className || '';
      tagProps.className = `${className}${className ? ' ' : ''}${
        metaProps.fieldTypeName
      }_${metaProps.elementName}`;
      return origRenderTag(tagName, tagProps, metaProps);
    },
  };
};

export default plugin;

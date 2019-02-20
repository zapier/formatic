import cx from 'classnames';

const plugin = prevConfig => {
  const classes = {
    Field: ({ field }) => ({
      'Formatic_Field-IsReadOnly': prevConfig.fieldIsReadOnly(field),
    }),
    Json_TextareaInput: ({ isValid }) => ({
      'Formatic_Json_TextareaInput-HasError': !isValid,
    }),
    PrettyText_PrettyTextInputTabTarget: ({ field }) => {
      if (prevConfig.fieldTemplateIsSingleLine(field.rawFieldTemplate)) {
        return {
          'Formatic_PrettyText_PrettyTextInputTabTarget-IsSingleLine': true,
          'Formatic_PrettyTextInputTabTarget-IsSingleLine': true,
        };
      }
      return undefined;
    },
    RequiredLabel: ({ field }) => {
      const errorSet = new Set(
        prevConfig.fieldErrors(field).map(error => error.type)
      );
      return {
        'Formatic_RequiredLabel-IsRequired': prevConfig.fieldIsRequired(field),
        'Formatic_RequiredLabel-IsNotRequired': !prevConfig.fieldIsRequired(
          field
        ),
        'Formatic_RequiredLabel-IsRequiredError': errorSet.has('required'),
      };
    },
    SelectArrow: ({ isOpen }) => {
      return {
        'Formatic_SelectArrow-IsOpen': isOpen,
      };
    },
  };

  const origRenderTag = prevConfig.renderTag;

  return {
    renderTag: (tagName, tagProps, metaProps, ...children) => {
      tagProps = {
        ...tagProps,
      };
      const typeName = metaProps.typeName || metaProps.parentTypeName;
      const { elementName } = metaProps;
      const fieldElementName = `${typeName}_${elementName}`;
      tagProps.className = cx(
        tagProps.className,
        `Formatic_${fieldElementName}`,
        `Formatic_${elementName}`,
        classes[typeName] && classes[typeName](metaProps),
        classes[elementName] && classes[elementName](metaProps),
        classes[fieldElementName] && classes[fieldElementName](metaProps)
      );
      return origRenderTag(tagName, tagProps, metaProps, ...children);
    },
  };
};

export default plugin;

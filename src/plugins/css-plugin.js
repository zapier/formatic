import cx from 'classnames';

const plugin = config => {
  const { renderTag } = config;
  const classes = {
    ChoicesItem: ({ isHovering }) => ({
      'Formatic_ChoicesItem-isHovering': isHovering,
    }),
    Field: ({ field }) => ({
      'Formatic_Field-IsReadOnly': config.fieldIsReadOnly(field),
    }),
    Json_TextareaInput: ({ isValid }) => ({
      'Formatic_Json_TextareaInput-HasError': !isValid,
    }),
    PrettyText_PrettyTextInputTabTarget: ({ field }) => {
      if (config.fieldTemplateIsSingleLine(field.rawFieldTemplate)) {
        return {
          'Formatic_PrettyText_PrettyTextInputTabTarget-IsSingleLine': true,
          'Formatic_PrettyTextInputTabTarget-IsSingleLine': true,
        };
      }
      return undefined;
    },
    RequiredLabel: ({ field }) => {
      const errorSet = new Set(
        config.fieldErrors(field).map(error => error.type)
      );
      return {
        'Formatic_RequiredLabel-IsRequired': config.fieldIsRequired(field),
        'Formatic_RequiredLabel-IsNotRequired': !config.fieldIsRequired(field),
        'Formatic_RequiredLabel-IsRequiredError': errorSet.has('required'),
      };
    },
    SelectArrow: ({ isOpen }) => {
      return {
        'Formatic_SelectArrow-IsOpen': isOpen,
      };
    },
  };

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
      return renderTag(tagName, tagProps, metaProps, ...children);
    },
  };
};

export default plugin;

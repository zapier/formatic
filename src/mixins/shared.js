import _ from '@/src/undash';

export default {
  // Start an action bubbling up through parent components.
  onStartAction: function(action, props) {
    if (this.props.onAction) {
      const info = _.extend({}, props);
      info.action = action;
      info.field = this.props.field;
      this.props.onAction(info);
    }
  },

  // Bubble up an action.
  onBubbleAction: function(info) {
    if (this.props.onAction) {
      this.props.onAction(info);
    }
  },

  onFocusAction: function() {
    this.onStartAction('focus');
  },

  onBlurAction: function() {
    this.onStartAction('blur');
  },

  isDisabled: function() {
    return this.props.config.fieldIsDisabled(this.props.field);
  },

  isReadOnly: function() {
    return this.props.config.fieldIsReadOnly(this.props.field);
  },

  renderWith: function(elementName, extraProps) {
    const { config, field, typeName, parentTypeName } = this.props;
    const props = {
      field,
      elementName,
    };
    if (extraProps) {
      _.extend(props, extraProps);
    }
    if (typeName) {
      props.typeName = typeName;
    } else if (parentTypeName) {
      props.parentTypeName = parentTypeName;
    } else {
      props.typeName = this.constructor.displayName;
    }
    return {
      renderTag: config.renderTag,
      props,
    };
  },
};

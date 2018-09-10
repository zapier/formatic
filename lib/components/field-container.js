import React from 'react';

import fieldMixin from '../mixins/field';

class FieldContainer extends React.Component {
  onChangeValue = fieldMixin.onChangeValue.bind(this);
  onBubbleValue = fieldMixin.onBubbleValue.bind(this);
  onStartAction = fieldMixin.onStartAction.bind(this);
  onFocusAction = fieldMixin.onFocusAction.bind(this);
  onBlurAction = fieldMixin.onBlurAction.bind(this);
  onBubbleAction = fieldMixin.onBubbleAction.bind(this);
  isReadOnly = fieldMixin.isReadOnly.bind(this);
  constructor() {
    super();
    this.methods = {
      onChangeValue: this.onChangeValue,
      onBubbleValue: this.onBubbleValue,
      onStartAction: this.onStartAction,
      onFocusAction: this.onFocusAction,
      onBlurAction: this.onBlurAction,
      onBubbleAction: this.onBubbleAction,
      isReadOnly: this.onReadOnly,
    };
  }
  render() {
    return this.props.children({
      ...this.methods,
      ...this.props,
    });
  }
}

export default FieldContainer;

import React from 'react';

import fieldMixin from '@/src/mixins/field';

// A better way to add new field types vs the old mixins approach. This
// component abstracts away our ugly old mixins into a component with a render
// callback. That way, we can eventually deprecate the mixins and do a much
// grander refactor.
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
      onFocus: this.onFocusAction,
      onBlur: this.onBlurAction,
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

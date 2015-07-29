import React from 'react';

const StringInput = React.createClass({

  displayName: 'StringInput',

  // propTypes: {
  //   component: React.PropTypes.func.required
  // },

  onChange(event) {
    const {onChange} = this.props;

    if (onChange) {
      onChange({
        value: event.target.value
      });
    }
  },

  onFocus() {
    const {onFocus} = this.props;

    if (onFocus) {
      onFocus({});
    }
  },

  onBlur() {
    const {onBlur} = this.props;

    if (onBlur) {
      onBlur({});
    }
  },

  render() {
    const {Component} = this.props;
    const {onChange, onFocus, onBlur} = this;
    return <Component $type="StringInputView" {...this.props} {...{onChange, onFocus, onBlur}}/>;
  }
});

export default StringInput;

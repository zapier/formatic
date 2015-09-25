import React from 'react';

const StringInput = React.createClass({

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
    const {onChange, onFocus, onBlur} = this;
    return <textarea value={this.props.value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}/>;
  }
});

export default StringInput;

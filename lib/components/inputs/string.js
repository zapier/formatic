import React from 'react';

const StringInput = React.createClass({

  statics: {
    hasEvent: true
  },

  propTypes: {
    value: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  render() {
    const {value, onChange, onFocus, onBlur} = this.props;
    return <textarea value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}/>;
  }
});

export default StringInput;

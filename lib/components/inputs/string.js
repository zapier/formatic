import React from 'react';

const StringInput = React.createClass({
  render() {
    const {value, onChange, onFocus, onBlur} = this.props;
    return <textarea value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur}/>;
  }
});

export default StringInput;

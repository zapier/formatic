import React, { PropTypes } from 'react';
import JsonInputState from './JsonInputState';
import JsonInputValidator from './JsonInputValidator';

const JsonInput = React.createClass({

  propTypes: {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any,
    source: PropTypes.string,
    isValid: PropTypes.bool
  },

  getDefaultProps() {
    return {
      value: null
    };
  },

  render() {
    const { getComponent, value, source, isValid, onChange } = this.props;
    const View = getComponent('JsonInputView');
    return <JsonInputState {...{value, source, isValid, onChange}} validator={JsonInputValidator} view={View}/>;
  }
});

export default JsonInput;

import React, { PropTypes } from 'react';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';

const validateJson = (source) => {
  try {
    const value = JSON.parse(source);
    return {
      value,
      isValid: true
    };
  } catch (e) {
    return {
      value: null,
      isValid: false
    };
  }
};

const JsonInputValidator = React.createClass({

  propTypes: {
    value: PropTypes.any.isRequired,
    source: PropTypes.string,
    isValid: PropTypes.bool,
    view: PropTypes.func.isRequired
  },

  onChange(source) {
    const { onChange, value: currentValue } = this.props;
    const validation = validateJson(source);
    if (validation.isValid) {
      onChange(validation.value, {
        isValid: true,
        source
      });
    } else {
      onChange(currentValue, {
        isValid: false,
        source
      });
    }
  },

  render() {
    const { props, onChange } = this;
    const { view: View, value } = props;
    const source = isString(props.source) ? props.source : JSON.stringify(value, null, 2);
    const isValid = isUndefined(props.isValid) ? validateJson(source).isValid : props.isValid;
    return <View {...props} onChange={onChange} source={source} isValid={isValid}/>;
  }
});

export default JsonInputValidator;

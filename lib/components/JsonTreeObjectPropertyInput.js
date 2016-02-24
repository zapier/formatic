import React, { PropTypes } from 'react';

import JsonTreeObjectPropertyInputView from './JsonTreeObjectPropertyInputView';

const JsonTreeObjectPropertyInput = React.createClass({

  propTypes: {
    onChangeKey: PropTypes.func.isRequired,
    onChangeValue: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      view: JsonTreeObjectPropertyInputView,
      propertyKey: '',
      propertyValue: null
    };
  },

  render() {
    const { view: View, index, propertyKey, propertyValue, onChangeKey, onChangeValue } = this.props;
    return <View index={index} propertyKey={propertyKey} propertyValue={propertyValue} onChangeKey={onChangeKey} onChangeValue={onChangeValue}/>;
  }
});

export default JsonTreeObjectPropertyInput;

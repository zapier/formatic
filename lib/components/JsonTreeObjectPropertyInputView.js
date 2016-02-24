import React from 'react';

import TextInput from './TextInput';

const JsonTreeObjectPropertyInputView = React.createClass({

  render() {
    const { index, propertyKey, propertyValue, onRemove, onChangeKey } = this.props;
    return (
      <div>
        <div>key:<TextInput inputKey={index} value={propertyKey} onChange={onChangeKey}/></div>
        <div>value:{propertyValue}</div>
        <button onClick={onRemove}>Remove</button>
      </div>
    );
  }
});

export default JsonTreeObjectPropertyInputView;

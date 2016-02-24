import React, { PropTypes } from 'react';
import _ from 'lodash';

import JsonTreeObjectPropertyInput from './JsonTreeObjectPropertyInput';

const JsonTreeObjectInputView = React.createClass({

  propTypes: {
    pairs: PropTypes.array.isRequired
  },

  render() {
    let { pairs, onAddProperty, onRemoveProperty, onChangePropertyKey, onChangePropertyValue } = this.props;
    return (
      <div>
      {
        pairs
          .map(({id, key, value}, index) => (
            <JsonTreeObjectPropertyInput key={id} index={index} propertyValue={value} propertyKey={key}
              onChangeKey={onChangePropertyKey} onChangeValue={onChangePropertyValue}/>
          ))
      }
        <button onClick={onAddProperty}>Add</button>
      </div>
    );
  }
});

export default JsonTreeObjectInputView;

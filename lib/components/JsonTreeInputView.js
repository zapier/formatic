import React from 'react';
import _ from 'lodash';
import JsonTreeObjectInput from './JsonTreeObjectInput';
import JsonTreeArrayInput from './JsonTreeArrayInput';
import JsonTreeStringInput from './JsonTreeStringInput';
import JsonTreeNumberInput from './JsonTreeNumberInput';
import JsonTreeBooleanInput from './JsonTreeBooleanInput';
import JsonTreeNullInput from './JsonTreeNullInput';

const typeNameToComponent = {
  Object: JsonTreeObjectInput,
  Array: JsonTreeArrayInput,
  String: JsonTreeStringInput,
  Number: JsonTreeNumberInput,
  Boolean: JsonTreeBooleanInput,
  Null: JsonTreeNullInput
};

const typeToPascallName = {
  object: 'Object',
  number: 'Number',
  boolean: 'Boolean'
};

const getTypeName = value => {
  if (value === null) {
    return 'Null';
  }
  if (_.isArray(value)) {
    return 'Array';
  }
  const type = typeof value;
  return typeToPascallName[type];
};

const JsonTreeInputView = React.createClass({

  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    theme: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      value: null,
      theme: {}
    };
  },

  render() {
    const { value, onChange } = this.props;
    const typeName = getTypeName(value);
    const Component = typeNameToComponent[typeName];
    return <Component value={value} onChange={onChange}/>;
  }
});

export default JsonTreeInputView;

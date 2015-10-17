import React from 'react';

const createField = (Input, {name} = {}) => {

  if (!name) {
    if (Input.displayName.indexOf('Input') > 0) {
      name = Input.displayName.substring(0, Input.displayName.indexOf('Input'));
    }
  }

  if (!name) {
    throw new Error('Field requires a displayName.');
  }

  const FieldInput = React.createClass({

    displayName: name,

    propTypes: {
      components: React.PropTypes.object.isRequired
    },

    render() {

      const {Field} = this.props.components;

      return (
        <Field {...this.props}>
          <Input {...this.props}/>
        </Field>
      );
    }
  });

  return FieldInput;
};

export default createField;

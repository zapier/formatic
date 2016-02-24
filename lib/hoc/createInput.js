import React from 'react';

const createInput = (name, DefaultViewComponent) => {

  const Input = React.createClass({

    displayName: `${name}Input`,

    propTypes: {
      onChange: React.PropTypes.func.isRequired
    },

    getDefaultProps() {
      return {
        view: DefaultViewComponent,
        value: null
      };
    },

    onChange(value) {
      const { onChange, inputKey } = this.props;
      onChange(value, {inputKey});
    },

    render() {
      const { view: View, value } = this.props;
      const { onChange } = this;
      return <View value={value} onChange={onChange}/>;
    }
  });

  return Input;
};

export default createInput;

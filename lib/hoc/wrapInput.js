import React from 'react';

const wrapInput = (Component) => {

  const Input = React.createClass({

    propTypes: {
      onChange: React.PropTypes.func.isRequired
    },

    getDefaultProps() {
      return {
        value: null
      };
    },

    onChange(value) {
      const { onChange, inputKey } = this.props;
      onChange(value, {inputKey});
    },

    render() {
      const { props, onChange } = this;
      return <Component {...props} onChange={onChange}/>;
    }
  });

  return Input;
};

export default wrapInput;

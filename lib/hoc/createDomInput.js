import React from 'react';

const defaultGetValueFromEvent = event => event.target.value;
const defaultGetProps = () => ({});

const createDomInput = (name, {
  getValueFromEvent = defaultGetValueFromEvent,
  getProps = defaultGetProps
} = {}) => {

  const DomInput = React.createClass({

    displayName: `Dom${name}Input`,

    propTypes: {
      onChange: React.PropTypes.func.isRequired
    },

    getDefaultProps() {
      return {
        value: null
      };
    },

    onChange(event) {
      const { onChange, inputKey } = this.props;
      const value = getValueFromEvent(event);
      onChange(value, {inputKey});
    },

    render() {
      const { props, onChange } = this;
      const { value, getComponent, style, className } = props;
      const View = getComponent(`Dom${name}InputView`);
      return <View {...{value, onChange, style, className}} {...getProps(props)}/>;
    }
  });

  return DomInput;
};

export default createDomInput;

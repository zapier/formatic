const React = require('react');
const wrap = require('./wrap-component');

export default (name) => {

  const InputClass = class extends React.Component {

    constructor(props, context) {
      super(props, context);
    }

    render() {
      const Input = this.props.component('Input');

      return (
        <Input {...this.props} type={name}/>
      );
    }

  };

  InputClass.prototype.displayName = name + 'Input';

  return wrap(InputClass);
};

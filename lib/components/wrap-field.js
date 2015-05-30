const React = require('react');
const Config = require('../config');

export default (FieldComponent) => {

  const WrapField = class extends React.Component {

    constructor(props, context) {
      super(props, context);

      this.state = {
        config: Config.forComponent(this)
      };
    }

    render() {
      return <Component {...this.props} {...this.state}/>;
    }

  };

  return WrapField;
};

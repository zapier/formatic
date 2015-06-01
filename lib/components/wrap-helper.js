const React = require('react');
const Config = require('../config');

export default (HelperComponent) => {

  const WrapHelper = class extends React.Component {

    constructor(props, context) {
      super(props, context);

      this.state = {
        config: Config.forComponent(this)
      };
    }

    render() {
      return <HelperComponent {...this.props} {...this.state}/>;
    }

  };

  return WrapHelper;
};

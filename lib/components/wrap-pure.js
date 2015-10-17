import React from 'react';

const wrapPure = (Component) => {

  const WrapPure = React.createClass({

    mixins: [React.PureRenderMixin],

    render() {
      return <Component {...this.props}/>;
    }
  });

  return WrapPure;
};

export default wrapPure;

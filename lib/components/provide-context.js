import React from 'react';

const provideContext = (Component, {
  childContext = () => ({})
} = {}) => {

  const ProvideContext = React.createClass({

    getChildContext() {
      return childContext(this.props);
    },

    render() {
      return <Component {...this.props}/>;
    }
  });

  return ProvideContext;
};

export default provideContext;

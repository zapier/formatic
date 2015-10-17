import React from 'react';
import u from '../undash';

const useContext = (Component, {contextTypes = {}, contextToProps = {}} = {}) => {

  const UseContext = React.createClass({

    contextTypes,

    propsFromContext() {
      const pairs = Object.keys(contextToProps).map(contextKey => {
        const propKey = contextToProps[contextKey];
        return [propKey, this.context[contextKey]];
      });
      return u.object(pairs);
    },

    render() {
      return <Component {...this.props} {...this.propsFromContext()}/>;
    }
  });

  return UseContext;
};

export default useContext;

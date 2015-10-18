import React from 'react';
import u from './undash';

const cloneChild = (children, props) => {
  if (u.isFunction(children)) {
    return children(props);
  }

  const child = React.Children.only(children);

  return React.cloneElement(child, props);
};

export {
  cloneChild
};

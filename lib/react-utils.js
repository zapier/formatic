import React from 'react';
import u from './undash';

const cloneChild = (children, props) => {

  if (u.isFunction(children)) {
    return children(props);
  }

  if (u.isNull(children) || u.isUndefined(children)) {
    if (props.onRender) {
      const {onRender, ...otherProps} = props;
      return onRender(otherProps);
    }

    return null;
  }

  const child = React.Children.only(children);

  return React.cloneElement(child, props);
};

export {
  cloneChild
};

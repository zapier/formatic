import React from 'react';

const createWrapper = (parentName, childName) => {

  const Wrapper = props => {
    const { getComponent } = props;
    const Child = getComponent(childName);
    return <Child {...props}/>;
  };

  Wrapper.displayName = parentName;

  return Wrapper;
};

export default createWrapper;

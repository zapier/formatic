import React from 'react';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import toPairs from 'lodash/toPairs';
import assign from 'lodash/assign';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import fromPairs from 'lodash/fromPairs';

const bindComponents = (components, getComponent) => {

  return flow(
    toPairs,
    map(([name, Component]) => {

      if (Component.__getComponent === getComponent) {
        return [name, Component];
      }

      const BoundComponent = props => <Component {...props} getComponent={getComponent}/>;

      BoundComponent.__getComponent = getComponent;

      return [name, BoundComponent];
    }),
    fromPairs
  )(components);
};

const createComponents = (...plugins) => {

  const components = {};

  const getComponent = name => {
    if (components[name]) {
      return components[name];
    }
    throw new Error(`Component not found: ${name}`);
  };

  plugins.forEach(plugin => {
    if (isFunction(plugin)) {
      const newComponents = plugin(getComponent);
      const newBoundComponents = bindComponents(newComponents, getComponent);
      assign(components, newBoundComponents);
    } else if (isObject(plugin)) {
      const newBoundComponents = bindComponents(plugin, getComponent);
      assign(components, newBoundComponents);
    }

    let newComponents = {};

    if (isFunction(plugin)) {
      newComponents = plugin(getComponent);
    } else if (isObject(plugin)) {
      newComponents = plugin;
    }

    const newBoundComponents = bindComponents(newComponents, getComponent);
    assign(components, newBoundComponents);
  });

  return components;
};

export default createComponents;

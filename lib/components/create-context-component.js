import React from 'react';
import _ from '../undash';
import Components from './';

export default (containerProps) => {

  const containerComponents = containerProps.components || {};

  const Component = class extends React.Component {

    constructor(props, context) {
      super(props, context);
    }

    matchedComponentClass() {
      if (_.isFunction(this.props.$type)) {
        return this.props.$type;
      }
      if (_.isString(this.props.$type)) {
        const MatchedComponent = containerComponents[this.props.$type] || Components[this.props.$type];
        if (!MatchedComponent) {
          throw new Error(`Component not found: ${this.props.$type}`);
        }
        return MatchedComponent;
      }
      throw new Error('Component requires $type to be a component class or name.');
    }

    render() {
      const MatchedComponent = this.matchedComponentClass();
      const propsWithoutName = {};
      Object.keys(this.props).forEach(propKey => {
        if (propKey === '$type') {
          return;
        }
        propsWithoutName[propKey] = this.props[propKey];
      });
      return <MatchedComponent {...propsWithoutName} {...{Component}}/>;
    }

  };

  Component.prototype.displayName = 'Component';

  return Component;
};

import React from 'react';
import _ from '../../undash';
import createContextComponent from '../create-context-component';

const ComponentContainer = React.createClass({

  render() {
    const {children} = this.props;

    const Component = createContextComponent(this.props);

    if (_.isFunction(children)) {
      return children(Component);
    }

    return (
      <span>
      {
        React.Children.map(child => React.cloneElement(child, {Component}))
      }
      </span>
    );
  }
});

export default ComponentContainer;

'use strict';

var React = require('react');

module.exports = function (formatic, plugin) {

  plugin.React = React;

  formatic.attachComponent = function (component, node, done) {
    return React.renderComponent(component, node, done);
  };

  formatic.detachComponent = function (node) {
    React.unmountComponentAtNode(node);
  };

  formatic.updateComponent = function (component, props) {
    component.setProps(props);
  };
};

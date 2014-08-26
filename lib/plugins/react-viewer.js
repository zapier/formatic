'use strict';

var React = require('react');

module.exports = function (formatic, plugin) {

  plugin.React = React;

  formatic.method('attachComponent', function (component, node, done) {
    return React.renderComponent(component, node, done);
  });

  formatic.method('detachComponent', function (node) {
    React.unmountComponentAtNode(node);
  });

  formatic.method('updateComponent', function (component, props) {
    component.setProps(props);
  });
};

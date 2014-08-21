'use strict';

var React = require('react');

var reactViewer = function (formatic) {

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

reactViewer.React = React;

module.exports = reactViewer;

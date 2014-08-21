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

  formatic.method('onChangeComponent', function (onChange, event) {
    if (event && event.target) {
      onChange(event.target.value);
    } else {
      onChange(event);
    }
  });

  formatic.method('onActionOfComponent', function (onAction, event) {
    if (event && event.target) {
      onAction();
    } else {
      onAction(event);
    }
  });
};

reactViewer.React = React;

module.exports = reactViewer;

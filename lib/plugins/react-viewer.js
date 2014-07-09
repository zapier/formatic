'use strict';

var React = require('react');

module.exports = function (formatic) {

  formatic.hook('attachComponent',function (component, node, done) {
    return React.renderComponent(component, node, done);
  });

  formatic.hook('detachComponent', function (node) {
    React.unmountComponentAtNode(node);
  });

  formatic.hook('updateComponent', function (component, props) {
    component.setProps(props);
  });

  formatic.hook('onChangeComponent', function (onChange, event) {
    onChange(event.target.value);
  });

};

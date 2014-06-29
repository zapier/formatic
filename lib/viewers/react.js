'use strict';

var React = require('react');

module.exports = function () {

  var viewer = {};

  viewer.render = function (component, node, done) {
    return React.renderComponent(component, node, done);
  };

  viewer.update = function (component, props) {
    component.setProps(props);
  };

  viewer.onChange = function (onChange, event) {
    onChange(event.target.value);
  };

  viewer.detach = function (node) {
    React.unmountComponentAtNode(node);
  };

  return viewer;
};

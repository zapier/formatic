// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

'use strict';

var _ = require('underscore');

module.exports = function (config) {

  var _createElement = config.createElement;

  var elementClasses = {};

  return {
    addElementClass: function addElementClass(name, className) {

      name = config.elementName(name);

      if (!elementClasses[name]) {
        elementClasses[name] = {};
      }

      elementClasses[name][className] = true;
    },

    // Wrap the createElement method.
    createElement: function createElement(name, props, children) {

      name = config.elementName(name);

      if (elementClasses[name]) {
        props = _.extend({}, props, { classes: elementClasses[name] });
      }

      return _createElement(name, props, children);
    }
  };
};
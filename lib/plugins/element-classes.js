// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

'use strict';

var _ = require('../undash');

module.exports = function (config) {

  var createElement = config.createElement;

  var elementClasses = {};

  return {
    addElementClass: function (name, className) {

      name = config.elementName(name);

      if (!elementClasses[name]) {
        elementClasses[name] = {};
      }

      elementClasses[name][className] = true;
    },

    // Wrap the createElement method.
    createElement: function (name, props, children) {

      name = config.elementName(name);

      if (elementClasses[name]) {
        props = _.extend({}, props, {classes: elementClasses[name]});
      }

      return createElement(name, props, children);
    }
  };
};

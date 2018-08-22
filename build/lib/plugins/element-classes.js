// # element-classes plugin

/*
This plugins provides a config method addElementClass that lets you add on a
class to an element.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (config) {

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
        props = _undash2.default.extend({}, props, { classes: elementClasses[name] });
      }

      return _createElement(name, props, children);
    }
  };
};

var _undash = require('../undash');

var _undash2 = _interopRequireDefault(_undash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
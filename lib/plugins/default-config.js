/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

'use strict';

var React = require('react/addons');
var _ = require('../undash');

console.log('require---')
var Components = require('../components');

console.log(Components);

var utils = require('../utils');

module.exports = function (config) {

  var delegateTo = utils.delegator(config);

  return {

    // Normalize an element name.
    elementName(name) {
      return utils.dashToPascal(name);
    },

    class(name) {
      if (!name) {
        throw new Error('Component class name must be specified to retrieve component class.');
      }
      name = config.elementName(name);
      if (Components[name]) {
        return Components[name];
      }
      throw new Error(`Component class ${name} not found.`);
    },

    helperClass(name) {
      if (!name) {
        throw new Error('Helper class name must be specified to retrieve component class.');
      }
      name = config.elementName(name);
      return config.class(name);
    },

    fieldClass(name) {
      if (!name) {
        throw new Error('Field class name must be specified to retrieve component class.');
      }
      name += '-field';
      name = config.elementName(name);
      return config.class(name);
    }
  };
};

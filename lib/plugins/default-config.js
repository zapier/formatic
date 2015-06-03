/*
This is the default configuration plugin for formatic. To change formatic's
behavior, just create your own plugin function that returns an object with
methods you want to add or override.
*/

'use strict';

// var React = require('react/addons');
// var _ = require('../undash');

const Components = require('../components');

const components = {};

Object.keys(Components.fields).forEach(name => {
  components[name + 'Field'] = Components.fields[name];
});

Object.keys(Components.helpers).forEach(name => {
  components[name] = Components.helpers[name];
});

var utils = require('../utils');

module.exports = function (config) {

  // var delegateTo = utils.delegator(config);

  return {

    // Normalize an element name.
    elementName(name) {
      return utils.dashToPascal(name);
    },

    componentClass(name) {
      if (!name) {
        throw new Error('Component class name must be specified to retrieve component class.');
      }
      name = config.elementName(name);
      if (components[name]) {
        return components[name];
      }
      throw new Error(`Component class ${name} not found.`);
    },

    helperClass(name) {
      if (!name) {
        throw new Error('Helper class name must be specified to retrieve component class.');
      }
      name = config.elementName(name);
      return config.componentClass(name);
    },

    fieldClass(name) {
      if (!name) {
        throw new Error('Field class name must be specified to retrieve component class.');
      }
      name += '-field';
      name = config.elementName(name);
      return config.componentClass(name);
    }
  };
};

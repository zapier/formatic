'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _ = require('./undash');

var defaultComponents = {};

var ComponentContainer = {
  setComponents: function setComponents(components) {
    defaultComponents = components;
  },
  components: function components(_components) {
    return _.extend({}, defaultComponents, _components);
  }
};

exports['default'] = ComponentContainer;
module.exports = exports['default'];
'use strict';

var _ = require('underscore');

var core = require('../core');

module.exports = function (formatic) {

  formatic.viewer(require('../viewers/react'));

  _.each(core.views.react, function (view, key) {
    formatic.view(key, view);
  });

  formatic.plugin(core.plugins.type);

  _.each(core.types, function (type, key) {
    formatic.type(key, type);
  });

};

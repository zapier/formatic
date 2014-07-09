'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

module.exports = function (formatic) {

  formatic.plugin(Formatic.plugins.core);
  formatic.plugin(Formatic.plugins.terse);
  formatic.plugin(Formatic.plugins.reactViewer);

  _.each(Formatic.views.react, function (view, key) {
    formatic.view(key, view);
  });
};

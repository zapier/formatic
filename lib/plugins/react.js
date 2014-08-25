'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

module.exports = function (formatic) {

  formatic.plugin(Formatic.plugins.core);
  formatic.plugin(Formatic.plugins.terse);
  formatic.plugin(Formatic.plugins.readOnly);
  formatic.plugin(Formatic.plugins.required);
  formatic.plugin(Formatic.plugins.reactViewer);

  _.each(Formatic.plugins.views.react, function (view, key) {
    formatic.plugin(view, {
      type: key
    });
  });
};

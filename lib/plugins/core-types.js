'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

module.exports = function (formatic) {

  _.each(Formatic.types, function (type, key) {
    formatic.plugin(type, {
      type: key
    });
  });
};

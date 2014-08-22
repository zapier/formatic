'use strict';

var _ = require('underscore');

var Formatic = require('../formatic');

module.exports = function (formatic) {

  _.each(Formatic.types, function (type, key) {
    //formatic.type(key, type);
    formatic.plugin(type, key);
  });
};

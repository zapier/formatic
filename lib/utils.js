'use strict';

var _ = require('underscore');

var utils = {};

utils.getObject = function (obj, key) {

  if (!_.isObject(obj)) {
    return undefined;
  }

  var parts = key.split('.');

  var value = obj[parts[0]];

  if (parts.length > 1) {

    return utils.getObject(value, parts.slice(1).join('.'));
  }

  return value;
};

utils.setObject = function (obj, key, value) {

  var parts = key.split('.');

  _.each(parts, function (part, i) {
    if (i === (parts.length - 1)) {
      return;
    }
    if (!(part in obj)) {
      obj[part] = {};
    }
    obj = obj[part];
  });

  key = parts[parts.length - 1];

  obj[key] = value;
};

module.exports = utils;

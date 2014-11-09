'use strict';

var _ = require('underscore');

var plugins = {
  if: function (plugin) {
    plugin.exports = function (args, field) {
      return field.eval(args[0]) ? field.eval(args[1]) : field.eval(args[2]);
    };
  },

  eq: function (plugin) {
    plugin.exports = function (args, field) {
      return field.eval(args[0]) === field.eval(args[1]);
    };
  },

  not: function (plugin) {
    plugin.exports = function (args, field) {
      return !field.eval(args[0]);
    };
  },

  get: function (plugin) {
    var get = plugin.exports = function (args, field) {
      var key = field.eval(args[0]);
      if (!_.isUndefined(field.value)) {
        if (key in field.value) {
          return field.value[key];
        }
      }
      if (field.parent) {
        return get(args, field.parent);
      }
      return undefined;
    };
  },

  getMeta: function (plugin) {
    var util = plugin.require('util');
    plugin.exports = function (args, field) {
      var keys = args.map(function (arg) {
        return field.eval(arg);
      });
      var key = util.joinMetaKeys(keys);
      return field.form.meta(key);
    };
  },

  sum: function (plugin) {
    plugin.exports = function (args, field) {
      var sum = 0;
      for (var i = 0; i < args.length; i++) {
        sum += field.eval(args[i]);
      }
      return sum;
    };
  }
};

// Build a plugin bundle.
_.each(plugins, function (fn, name) {
  module.exports['eval-function.' + name] = fn;
});

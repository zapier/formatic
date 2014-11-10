// # eval-functions

/*
Default eval functions. Each function is part of its own plugin, but all are
kept together here as part of a plugin bundle.

Note that eval functions decide when their arguments get evaluated. This way,
you can create control structures (like if) that conditionally evaluates its
arguments.
*/

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
      args = field.eval(args);
      var cacheKey = util.metaCacheKey(args[0], args[1]);
      return field.form.meta(cacheKey);
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

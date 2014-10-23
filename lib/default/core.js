'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (plugin) {

  plugin.exports = function (formatic) {

    var formaticPlugins = plugin.requireAll(plugin.config.formatic);
    var formPlugins = plugin.requireAll(plugin.config.form);

    formaticPlugins.forEach(function (f) {
      _.keys(f).forEach(function (key) {
        if (!_.isUndefined(formatic[key])) {
          throw new Error('Property already defined for formatic: ' + key);
        }
        formatic[key] = f[key];
      });
    });

    var Form = function (options) {
      if (this.init) {
        this.init(options);
      }
    };

    formatic.form = function (options) {
      return new Form(options);
    };

    Form.prototype = formatic.form;

    var inits = [];

    formPlugins.forEach(function (proto) {
      _.keys(proto).forEach(function (key) {
        if (key === 'init') {
          inits.push(proto[key]);
        } else {
          if (!_.isUndefined(Form.prototype[key])) {
            throw new Error('Property already defined for form: ' + key);
          }
          Form.prototype[key] = proto[key];
        }
      });
    });

    if (inits.length === 0) {
      Form.prototype.init = function () {};
    } else if (inits.length === 1) {
      Form.prototype.init = inits[0];
    } else {
      Form.prototype.init = function () {
        var form = this;
        var args = arguments;

        inits.forEach(function (init) {
          init.apply(form, args);
        });
      };
    }
  };

  //formatic.plugin('core.base');

  // formatic.filterPluginsInRegistry(function (plugin) {
  //   return plugin.name.indexOf('component.') === 0;
  // }).forEach(function (plugin) {
  //   formatic.plugin(plugin.name);
  // });
};

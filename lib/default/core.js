// # Core plugin (core)

// The core plugin exports a function that takes a formatic instance and
// extends the instance with additional methods.

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  plugin.exports = function (formatic) {

    // The core plugin really doesn't do much. It actually relies on other
    // plugins to do the dirty work. This way, you can easily add additional
    // plugins to do more dirty work.
    var formaticPlugins = plugin.requireAll(plugin.config.formatic);

    // We have special form plugins which are just used to modify the Form
    // prototype.
    var formPlugins = plugin.requireAll(plugin.config.form);

    // Pass the formatic instance off to each of the formatic plugins.
    formaticPlugins.forEach(function (f) {
      _.keys(f).forEach(function (key) {
        if (!_.isUndefined(formatic[key])) {
          throw new Error('Property already defined for formatic: ' + key);
        }
        formatic[key] = f[key];
      });
    });

    // ## Form prototype

    // The Form constructor creates a form given a set of options. Options
    // can have `fields` and `value`.
    var Form = function (options) {
      if (this.init) {
        this.init(options);
      }
    };

    // Add the form factory to the formatic instance.
    formatic.form = function (options) {
      return new Form(options);
    };

    Form.prototype = formatic.form;

    // Keep form init methods here.
    var inits = [];

    // Go through form plugins and add each plugin's methods to the form
    // prototype.
    formPlugins.forEach(function (proto) {
      _.keys(proto).forEach(function (key) {
        // Init plugins can be stacked.
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

    // Create an init method for the form prototype based on the available init
    // methods.
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
};

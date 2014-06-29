'use strict';

var _ = require('underscore');

var createForm = require('./form');
var core = require('./core');

var createFormatic = function () {

  var formatic;

  formatic = function () {
    return formatic.form();
  };

  var plugins = [];
  formatic.plugins = plugins;

  formatic.plugin = function (createPlugin) {
    var plugin = createPlugin(formatic);
    plugins.push(plugin);
  };

  formatic.config = function (config) {
    if (_.isString(config)) {
      config = core.configs[config];
    }
    config(formatic);
  };

  formatic.views = {};

  formatic.view = function (typeName, view) {
    formatic.views[typeName] = view;
  };

  formatic.viewer = null;

  formatic.viewer = function (viewer) {
    if (_.isFunction(viewer)) {
      viewer = viewer();
    }
    formatic.viewer = viewer;
  };

  formatic.form = createForm.bind(null, formatic);

  _.each(arguments, function (config) {
    formatic.config(config);
  });

  return formatic;
};

_.each(core, function (prop, key) {

  createFormatic[key] = prop;

});

module.exports = createFormatic;

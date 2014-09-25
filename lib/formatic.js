'use strict';

var _ = require('underscore');

var utils = require('./utils');

var pluginRegistry = {};

var Plugin = function () {
  if (!(this instanceof Plugin)) {
    return new Plugin();
  }
};

Plugin.prototype.configValue = function (key, defaultValue) {

  if (typeof this.config[key] !== 'undefined') {
    return this.config[key];
  }
  return defaultValue || '';
};

var Formatic = function () {

  var formatic;

  formatic = function (fields) {
    return formatic.form(fields);
  };

  formatic.registerPlugin = function (name, pluginFactory, config) {
    pluginRegistry[name] = {
      create: pluginFactory,
      config: config || {},
      name: name
    };
  };

  formatic.registerPlugins = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.forEach(function (plugin) {
      formatic.registerPlugin(plugin[0], plugin[1], plugin[2]);
    });
  };

  formatic.filterPluginsInRegistry = function (testFn) {
    return Object.keys(pluginRegistry).map(function (key) {
      return pluginRegistry[key];
    }).filter(function (plugin) {
      return testFn(plugin);
    });
  };

  var pluginCallbacks = [];

  var unknownPluginId = 0;

  var plugins = {};

  var getConfig = function (name, key) {
    if (!plugins[name]) {
      return null;
    }
    if (!key) {
      return plugins[name].config;
    }
    return plugins[name].config[key] || null;
  };

  var setConfig = function (name, key, config) {
    if (!plugins[name]) {
      throw new Error('No config for plugin: ' + name);
    }
    if (!key) {
      if (!_.isObject(config)) {
        throw new Error('Invalid config for plugin: ' + name);
      }
      _.extend(plugins[name].config, config);
    }
    plugins[name].config[key] = config;
  };

  formatic.config = function (key, config) {
    var pluginName = key;
    if (key.indexOf('.') >= 0) {
      pluginName = key.substring(0, key.indexOf('.'));
      key = key.substring(key.indexOf('.') + 1);
    } else {
      key = null;
    }
    if (typeof config === 'undefined') {
      return getConfig(pluginName, key);
    }
    setConfig(pluginName, key, config);
  };

  formatic.loadPlugin = function (pluginFactory, config) {
    config = config || {};
    var name = config.name;
    if (!name) {
      name = 'unknown_' + unknownPluginId;
      unknownPluginId++;
    }
    var plugin = Plugin();
    plugin = utils.wrappable(plugin);
    plugin.create = pluginFactory;
    plugin.config = config;
    plugin.name = name;
    pluginFactory(formatic, plugin);
    pluginCallbacks.forEach(function (cb) {
      cb(plugin);
    });
    plugins[name] = plugin;
    return plugin;
  };

  formatic.configurePlugin = function (name, config) {
    var plugin = plugins[name];
    _.extend(plugin.config, config);
    return plugin;
  };

  formatic.findPlugin = function (name, config) {
    if (config && config.name) {
      name = config.name;
    }
    if (plugins[name]) {
      if (config) {
        return formatic.configurePlugin(name, config);
      } else {
        return plugins[name];
      }
    }
    return null;
  };

  formatic.findOrLoadPlugin = function (name, config) {
    var plugin = formatic.findPlugin(name, config);
    if (!plugin) {
      var pluginReg = pluginRegistry[name];
      if (pluginReg) {
        config = config || {};
        if (!config.name) {
          config.name = name;
        }
        plugin = formatic.loadPlugin(pluginReg.create, config);
      }
    }
    if (!plugin) {
      if (config && config.name) {
        name += '/' + config.name;
      }
      throw new Error('Plugin not found: ' + name);
    }
    return plugin;
  };

  formatic.plugin = function (name, pluginFactory, config) {
    // signature (pluginFactory, config)
    if (_.isFunction(name)) {
      config = pluginFactory;
      pluginFactory = name;
      return formatic.loadPlugin(pluginFactory, config);
    // signature (name, config)
    } else if (_.isString(name) && (_.isObject(pluginFactory) || _.isUndefined(pluginFactory)) && !_.isFunction(pluginFactory)) {
      config = pluginFactory;
      return formatic.findOrLoadPlugin(name, config);
    // signature (pluginName, pluginFactoryName, config)
    } else if (_.isString(name) && _.isString(pluginFactory)) {
      config = _.extend({}, config, {name: name});
      return formatic.findOrLoadPlugin(pluginFactory, config);
    }
    config = _.extend({}, config, {name: name});
    return formatic.loadPlugin(pluginFactory, config);
  };

  formatic.onPlugin = function (cb) {
    pluginCallbacks.push(cb);
  };

  formatic.create = function () {
    return Formatic.apply(null, arguments);
  };

  var Form = function (fields) {
    this.init(fields);
  };

  formatic.form = function (fields) {
    return new Form(fields);
  };

  Form.prototype = formatic.form;

  utils.wrappable(formatic);
  utils.wrappable(Form.prototype);
  formatic.wrappable = utils.wrappable;

  Form.prototype.init = function () {

  };

  // Take args like ('pluginA', {x: 1}).
  // Where {x: 1} is config for pluginA.
  for (var i = 0; i < arguments.length; i++) {
    var pluginFactory = arguments[i];
    var config = config || {};
    if (arguments[i + 1]) {
      var nextArg = arguments[i + 1];
      if (!_.isFunction(nextArg) && _.isObject(nextArg)) {
        config = nextArg;
        i++;
      }
    }
    formatic.plugin(pluginFactory, config);
  }

  return formatic;
};

var defaultFormatic = Formatic();

defaultFormatic.registerPlugins(
  ['core-fn', require('./plugins/core-fn')],
  ['core-data', require('./plugins/core-data')],
  ['core-type', require('./plugins/core-type')],
  ['core-types', require('./plugins/core-types')],
  ['core-view', require('./plugins/core-view')],
  ['core', require('./plugins/core')],
  ['default', require('./plugins/default')],
  ['label', require('./plugins/label')],
  ['prop-aliases', require('./plugins/prop-aliases')],

  ['types.wrapper', require('./types/wrapper')],
  ['types.data', require('./types/data')],
  ['types.null', require('./types/null')],
  ['types.string', require('./types/string')],
  ['types.object', require('./types/object')],
  ['types.array', require('./types/array')],

  ['views.formatic', require('./views/formatic')],
  ['views.field', require('./views/field')],
  ['views.fieldset', require('./views/fieldset')],
  ['views.text', require('./views/text')],
  ['views.select', require('./views/select')],
  ['views.list', require('./views/list')],
  ['views.list-item', require('./views/list-item')]

  // ,
  // ['core-meta', require('./plugins/core-meta')],
  // ['core-type', require('./plugins/core-type')],
  // ['core-types', require('./plugins/core-types')],
  // ['core-view', require('./plugins/core-view')],
  // ['core-validation', require('./plugins/core-validation')],
  // ['core', require('./plugins/core')],
  // ['terse', require('./plugins/terse')],
  // ['react', require('./plugins/react')],
  // ['zapier-types', require('./plugins/zapier-types')],
  // ['zapier-keys', require('./plugins/zapier-keys')],
  // ['react-viewer', require('./plugins/react-viewer')],
  // ['read-only', require('./plugins/read-only')],
  // ['required', require('./plugins/required')],
  // ['default', require('./plugins/default')],
  // ['bootstrap', require('./plugins/bootstrap')],
  //
  // ['type-formatic', require('./types/formatic')],
  // ['type-form', require('./types/form')],
  // ['type-fieldset', require('./types/fieldset')],
  // ['type-select', require('./types/select')],
  // ['type-text', require('./types/text')],
  // ['type-textarea', require('./types/text')],
  // ['type-pretty-textarea', require('./types/text')],
  // ['type-password', require('./types/text')],
  // ['type-checkbox', require('./types/checkbox')],
  // ['type-dropdown', require('./types/select')],
  // ['type-string', require('./types/text')],
  // ['type-float', require('./types/number')],
  // ['type-integer', require('./types/number')],
  // ['type-number', require('./types/number')],
  // ['type-json', require('./types/json')],
  // ['type-if', require('./types/if')],
  // ['type-get', require('./types/get')],
  // ['type-eq', require('./types/eq')],
  // ['type-list', require('./types/list')],
  // ['type-object', require('./types/object')],
  // ['type-code', require('./types/code')],
  //
  // ['view-formatic', require('./views/react/formatic')],
  // ['view-form', require('./views/react/form')],
  // ['view-field', require('./views/react/field')],
  // ['view-fieldset', require('./views/react/fieldset')],
  // ['view-code', require('./views/react/code')],
  // ['view-select', require('./views/react/select')],
  // ['view-text', require('./views/react/text')],
  // ['view-string', require('./views/react/text')],
  // ['view-textarea', require('./views/react/textarea')],
  // ['view-password', require('./views/react/text')],
  // ['view-checkbox', require('./views/react/checkbox')],
  // ['view-boolean-checkbox', require('./views/react/boolean-checkbox')],
  // ['view-pretty-textarea', require('./views/react/pretty-textarea')],
  // ['view-dropdown', require('./views/react/dropdown')],
  // ['view-json', require('./views/react/json')],
  // ['view-float', require('./views/react/text')],
  // ['view-integer', require('./views/react/text')],
  // ['view-number', require('./views/react/text')],
  // ['view-list', require('./views/react/list')],
  // ['view-list-item', require('./views/react/list-item')],
  // ['view-object', require('./views/react/object')],
  // ['view-object-item', require('./views/react/object-item')]
);

defaultFormatic.plugin('default');

module.exports = defaultFormatic;

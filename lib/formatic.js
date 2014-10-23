'use strict';

var _ = require('underscore');

var pluginRegistry = {};

var registerPlugin = function (name, pluginFactory) {
  if (pluginRegistry[name]) {
    throw new Error('Plugin ' + name + ' is already registered.');
  }
  pluginRegistry[name] = pluginFactory;
};

var defaultPluginConfig = {
  //
  // util: {
  //   plugin: function () {}
  // },
  // 'component.field': {
  //   plugin: function () {
  //
  //   }
  // }
  //
  core: {
    formatic: ['core.formatic'],
    form: ['core.form-init', 'core.form', 'core.field']
  },
  'core.form': {
    store: 'store.memory'
  },
  'field-router': {
    routes: ['field-routes']
  }
  // types: {
  //   // will fallback to calling plugin
  // },
  // components: {
  //   // will fallback to calling plugin
  // }
};

var Formatic = function (config) {

  config = _.extend({}, config);

  _.keys(defaultPluginConfig).forEach(function (key) {
    config[key] = _.extend({}, defaultPluginConfig[key], config[key]);
  });

  var formatic, Plugin;

  var pluginCache = {};

  // Plugin

  Plugin = function (config) {
    if (!(this instanceof Plugin)) {
      return new Plugin(config);
    }
    this.exports = {};
    this.config = config || {};
  };

  Plugin.prototype.configValue = function (key, defaultValue) {

    if (typeof this.config[key] !== 'undefined') {
      return this.config[key];
    }
    return defaultValue || '';
  };

  Plugin.prototype.require = function (name) {
    return formatic.plugin(name);
  };

  // Just here in case we want to dynamically choose component later.
  Plugin.prototype.component = function (name) {
    return formatic.plugin('component.' + name).component;
  };

  Plugin.prototype.hasPlugin = function (name) {
    return (name in pluginCache) || (name in pluginRegistry);
  };

  Plugin.prototype.requireAll = function (pluginList) {
    if (!pluginList) {
      pluginList = [];
    }
    if (!_.isArray(pluginList)) {
      pluginList = [pluginList];
    }
    pluginList = _.flatten(pluginList);
    return pluginList.map(function (plugin) {
      return this.require(plugin);
    }.bind(this));
  };

  // Plugin.prototype.plugins = function (pluginList) {
  //   if (!pluginList) {
  //     pluginList = [];
  //   }
  //   if (!_.isArray(pluginList)) {
  //     pluginList = [pluginList];
  //   }
  //   return pluginList.map(function (ref) {
  //     return PluginRef(ref);
  //   });
  // };

  // PluginRef

  // PluginRef = function (ref) {
  //   if (!(this instanceof PluginRef)) {
  //     return new PluginRef(ref);
  //   }
  //   this.ref = ref;
  //   this.cached = undefined;
  // };
  //
  // PluginRef.prototype.get = function () {
  //   if (this.cached === undefined) {
  //     if (_.isFunction(this.ref)) {
  //       var plugin = Plugin();
  //       var activePlugin = this.ref(plugin);
  //       this.cached = activePlugin;
  //     } else {
  //       this.cached = formatic.plugin(this.ref);
  //     }
  //   }
  //   return this.cached;
  // };

  var loadPlugin = function (name, pluginConfig) {
    var plugin;
    if (_.isFunction(name)) {

      var factory = name;

      if (_.isUndefined(factory.__exports__)) {
        plugin = Plugin(pluginConfig || {});
        factory(plugin);
        factory.__exports__ = plugin.exports;
      }

      return factory.__exports__;

    } else if (_.isUndefined(pluginCache[name])) {

      if (!pluginConfig && config[name]) {
        if (config[name].plugin) {
          return loadPlugin(config[name].plugin, config[name] || {});
        }
      }

      if (pluginRegistry[name]) {
        if (_.isFunction(pluginRegistry[name])) {
          plugin = Plugin(pluginConfig || config[name]);
          pluginRegistry[name](plugin);
          pluginCache[name] = plugin.exports;
        } else {
          throw new Error('Plugin ' + name + ' is not a function.');
        }
      } else {
        throw new Error('Plugin ' + name + ' not found.');
      }
    }
    return pluginCache[name];
  };

  //var plugins = {};

  formatic = function (options) {
    // plugins.core.forEach(function (plugin) {
    //   console.log(plugin.get());
    // });
    return formatic.form(options);
  };

  formatic.register = function (name, pluginFactory) {
    pluginRegistry[name] = pluginFactory;
    return formatic;
  };

  formatic.plugin = function (name) {
    return loadPlugin(name);
  };

  // var pluginConfig = config.plugin || {};
  // pluginConfig = _.extend({}, defaultPluginConfig, pluginConfig);
  // _.keys(pluginConfig).forEach(function (pluginType) {
  //   var pluginRefs = pluginConfig[pluginType];
  //   if (!_.isArray(pluginRefs)) {
  //     pluginRefs = [pluginRefs];
  //   }
  //   plugins[pluginType] = pluginRefs.map(function (pluginRef) {
  //     return PluginRef(formatic, pluginRef);
  //   });
  // });

  //console.log(plugins.core)

  formatic.create = Formatic;

  var core = loadPlugin('core');

  core(formatic);

  return formatic;

  //
  // formatic.registerPlugin = function (name, pluginFactory, config) {
  //   pluginRegistry[name] = {
  //     createPlugin: pluginFactory,
  //     config: config || {},
  //     name: name
  //   };
  // };
  //
  // formatic.registerPlugins = function () {
  //   var args = Array.prototype.slice.call(arguments, 0);
  //   args.forEach(function (plugin) {
  //     formatic.registerPlugin(plugin[0], plugin[1], plugin[2]);
  //   });
  // };
  //
  // formatic.filterPluginsInRegistry = function (testFn) {
  //   return Object.keys(pluginRegistry).map(function (key) {
  //     return pluginRegistry[key];
  //   }).filter(function (plugin) {
  //     return testFn(plugin);
  //   });
  // };
  //
  // var pluginCallbacks = [];
  //
  // var unknownPluginId = 0;
  //
  // var plugins = {};
  //
  // var getConfig = function (name) {
  //   if (!plugins[name]) {
  //     return null;
  //   }
  //   return plugins[name].config;
  // };
  //
  // var setConfig = function (name, config) {
  //   if (!plugins[name]) {
  //     throw new Error('No config for plugin: ' + name);
  //   }
  //   if (!_.isObject(config)) {
  //     throw new Error('Invalid config for plugin: ' + name);
  //   }
  //   _.extend(plugins[name].config, config);
  // };
  //
  // formatic.config = function (name, config) {
  //   if (typeof config === 'undefined') {
  //     return getConfig(name);
  //   }
  //   setConfig(name, config);
  // };
  //
  // formatic.loadPlugin = function (pluginFactory, config) {
  //   config = config || {};
  //   var name = config.name;
  //   if (!name) {
  //     name = 'unknown_' + unknownPluginId;
  //     unknownPluginId++;
  //   }
  //   var plugin = Plugin();
  //   plugin.createPlugin = pluginFactory;
  //   plugin.config = config;
  //   plugin.name = name;
  //   pluginFactory(formatic, plugin);
  //   pluginCallbacks.forEach(function (cb) {
  //     cb(plugin);
  //   });
  //   plugins[name] = plugin;
  //   return plugin;
  // };
  //
  // formatic.configurePlugin = function (name, config) {
  //   var plugin = plugins[name];
  //   _.extend(plugin.config, config);
  //   return plugin;
  // };
  //
  // formatic.findPlugin = function (name, config) {
  //   if (config && config.name) {
  //     name = config.name;
  //   }
  //   if (plugins[name]) {
  //     if (config) {
  //       return formatic.configurePlugin(name, config);
  //     } else {
  //       return plugins[name];
  //     }
  //   }
  //   return null;
  // };
  //
  // formatic.findOrLoadPlugin = function (name, config) {
  //   var plugin = formatic.findPlugin(name, config);
  //   if (!plugin) {
  //
  //     var pluginReg = pluginRegistry[name];
  //     if (pluginReg) {
  //       config = config || {};
  //       if (!config.name) {
  //         config.name = name;
  //       }
  //       plugin = formatic.loadPlugin(pluginReg.createPlugin, config);
  //     }
  //   }
  //   if (!plugin) {
  //     if (config && config.name) {
  //       name += '/' + config.name;
  //     }
  //     throw new Error('Plugin not found: ' + name);
  //   }
  //   return plugin;
  // };
  //
  // formatic.hasPlugin = function (name) {
  //   if (plugins[name] || pluginRegistry[name]) {
  //     return true;
  //   }
  //   return false;
  // };
  //
  // formatic.plugin = function (name, pluginFactory, config) {
  //   // signature (pluginFactory, config)
  //   if (_.isFunction(name)) {
  //     config = pluginFactory;
  //     pluginFactory = name;
  //     return formatic.loadPlugin(pluginFactory, config);
  //   // signature (name, config)
  //   } else if (_.isString(name) && (_.isObject(pluginFactory) || _.isUndefined(pluginFactory)) && !_.isFunction(pluginFactory)) {
  //     config = pluginFactory;
  //     return formatic.findOrLoadPlugin(name, config);
  //   // signature (pluginName, pluginFactoryName, config)
  //   } else if (_.isString(name) && _.isString(pluginFactory)) {
  //     config = _.extend({}, config, {name: name});
  //     return formatic.findOrLoadPlugin(pluginFactory, config);
  //   }
  //   config = _.extend({}, config, {name: name});
  //   return formatic.loadPlugin(pluginFactory, config);
  // };
  //
  // formatic.onPlugin = function (cb) {
  //   pluginCallbacks.push(cb);
  // };
  //
  // formatic.create = function () {
  //   return Formatic.apply(null, arguments);
  // };
  //
  // var Form = function (options) {
  //   if (this.init) {
  //     this.init(options);
  //   }
  // };
  //
  // formatic.form = function (options) {
  //   return new Form(options);
  // };
  //
  // Form.prototype = formatic.form;
  //
  // Form.prototype.init = function () {
  //
  // };
  //
  // // Take args like ('pluginA', {x: 1}).
  // // Where {x: 1} is config for pluginA.
  // for (var i = 0; i < arguments.length; i++) {
  //   var pluginFactory = arguments[i];
  //   var config = {};
  //   if (arguments[i + 1]) {
  //     var nextArg = arguments[i + 1];
  //     if (!_.isFunction(nextArg) && _.isObject(nextArg)) {
  //       config = nextArg;
  //       i++;
  //     }
  //   }
  //   formatic.plugin(pluginFactory, config);
  // }
  //
  // return formatic;
};

var registerPlugins = function () {
  var arg = _.toArray(arguments);
  arg.forEach(function (arg) {
    var name = arg[0];
    var plugin = arg[1];
    registerPlugin(name, plugin);
  });
};

registerPlugins(
  ['core', require('./default/core')],

  ['core.formatic', require('./core/formatic')],
  ['core.form-init', require('./core/form-init')],
  ['core.form', require('./core/form')],
  ['core.field', require('./core/field')],

  ['util', require('./default/util')],
  ['compiler', require('./default/compiler')],
  ['field-router', require('./default/field-router')],
  ['field-routes', require('./default/field-routes')],
  //['types', require('./default/types')],

  ['store.memory', require('./store/memory')],

  ['type.root', require('./types/root')],
  ['type.string', require('./types/string')],
  ['type.object', require('./types/object')],
  ['type.boolean', require('./types/boolean')],
  ['type.array', require('./types/array')],

  ['component.formatic', require('./components/formatic')],
  ['component.root', require('./components/root')],
  ['component.field', require('./components/field')],
  ['component.label', require('./components/label')],
  ['component.help', require('./components/help')],
  ['component.fieldset', require('./components/fieldset')],
  ['component.text', require('./components/text')],
  ['component.textarea', require('./components/textarea')],
  ['component.select', require('./components/select')],
  ['component.list', require('./components/list')],
  ['component.list-control', require('./components/list-control')],
  ['component.list-item', require('./components/list-item')],
  ['component.list-item-value', require('./components/list-item-value')],
  ['component.list-item-control', require('./components/list-item-control')],
  ['component.item-choices', require('./components/item-choices')],
  ['component.add-item', require('./components/add-item')],
  ['component.remove-item', require('./components/remove-item')],
  ['component.move-item-back', require('./components/move-item-back')],
  ['component.move-item-forward', require('./components/move-item-forward')],
  ['component.json', require('./components/json')],
  ['component.checkbox-list', require('./components/checkbox-list')]
);

var defaultFormatic = Formatic();

// defaultFormatic.register('foo', function (plugin) {
//   console.log('once')
//   plugin.exports.bar = 5;
// })

//defaultFormatic.registerPlugins(
  // ['core', require('./plugins/core')],
  // ['core.base', require('./core/base')],
  //
  // ['component.formatic', require('./components/formatic')],
  // ['component.root', require('./components/root')],
  // ['component.field', require('./components/field')],
  // ['component.label', require('./components/label')],
  // ['component.help', require('./components/help')],
  // ['component.fieldset', require('./components/fieldset')],
  // ['component.text', require('./components/text')],
  // ['component.textarea', require('./components/textarea')],
  // ['component.select', require('./components/select')],
  // ['component.list', require('./components/list')],
  // ['component.list-control', require('./components/list-control')],
  // ['component.list-item', require('./components/list-item')],
  // ['component.list-item-value', require('./components/list-item-value')],
  // ['component.list-item-control', require('./components/list-item-control')],
  // ['component.item-choices', require('./components/item-choices')],
  // ['component.add-item', require('./components/add-item')],
  // ['component.remove-item', require('./components/remove-item')],
  // ['component.move-item-back', require('./components/move-item-back')],
  // ['component.move-item-forward', require('./components/move-item-forward')],
  // ['component.json', require('./components/json')],
  // ['component.checkbox-list', require('./components/checkbox-list')],
  //
  // ['bootstrap', require('./plugins/bootstrap')],
  //
  // ['type.root', require('./types/root')],
  // ['type.string', require('./types/string')],
  // ['type.object', require('./types/object')],
  // ['type.boolean', require('./types/boolean')],
  // ['type.array', require('./types/array')],
  //
  // ['store.memory', require('./stores/memory')]

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
  // ['view-formatic', require('./components/react/formatic')],
  // ['view-form', require('./components/react/form')],
  // ['view-field', require('./components/react/field')],
  // ['view-fieldset', require('./components/react/fieldset')],
  // ['view-code', require('./components/react/code')],
  // ['view-select', require('./components/react/select')],
  // ['view-text', require('./components/react/text')],
  // ['view-string', require('./components/react/text')],
  // ['view-textarea', require('./components/react/textarea')],
  // ['view-password', require('./components/react/text')],
  // ['view-checkbox', require('./components/react/checkbox')],
  // ['view-boolean-checkbox', require('./components/react/boolean-checkbox')],
  // ['view-pretty-textarea', require('./components/react/pretty-textarea')],
  // ['view-dropdown', require('./components/react/dropdown')],
  // ['view-json', require('./components/react/json')],
  // ['view-float', require('./components/react/text')],
  // ['view-integer', require('./components/react/text')],
  // ['view-number', require('./components/react/text')],
  // ['view-list', require('./components/react/list')],
  // ['view-list-item', require('./components/react/list-item')],
  // ['view-object', require('./components/react/object')],
  // ['view-object-item', require('./components/react/object-item')]
//);

//defaultFormatic.plugin('core');

module.exports = defaultFormatic;

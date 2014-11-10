// # compiler

// The compiler plugin knows how to normalize field definitions into standard
// field definitions that can be understood be routers and components.

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  // Grab all the compiler plugins which can be stacked.
  var compilerPlugins = plugin.requireAll(plugin.config.compilers);

  var util = plugin.require('util');

  var compiler = plugin.exports;

  // For a set of fields, make a map of template names to field definitions. All
  // field definitions can be used as templates, whether marked as templates or
  // not.
  compiler.templateMap = function (fields) {
    var map = {};
    fields.forEach(function (field) {
      if (field.key) {
        map[field.key] = field;
      }
      if (field.id) {
        map[field.id] = field;
      }
    });
    return map;
  };

  // Fields and items can extend other field definitions. Fields can also have
  // child fields that point to other field definitions. Here, we expand all
  // those out so that components don't have to worry about this.
  compiler.expandDef = function (def, templateMap) {
    var isTemplate = def.template;
    var ext = def.extends;
    if (_.isString(ext)) {
      ext = [ext];
    }
    if (ext) {
      var bases = ext.map(function (base) {
        var template = templateMap[base];
        if (!template) {
          throw new Error('Template ' + base + ' not found.');
        }
        return template;
      });
      var chain = [{}].concat(bases.reverse().concat([def]));
      def = _.extend.apply(_, chain);
    }
    if (def.fields) {
      def.fields = def.fields.map(function (childDef) {
        if (!_.isString(childDef)) {
          return compiler.expandDef(childDef, templateMap);
        }
        return childDef;
      });
    }
    if (def.items) {
      def.items = def.items.map(function (itemDef) {
        if (!_.isString(itemDef)) {
          return compiler.expandDef(itemDef, templateMap);
        }
        return itemDef;
      });
    }
    if (!isTemplate && def.template) {
      delete def.template;
    }
    return def;
  };

  // For an array of field definitions, expand each field definition.
  compiler.expandFields = function (fields) {
    var templateMap = compiler.templateMap(fields);
    return fields.map(function (def) {
      return compiler.expandDef(def, templateMap);
    });
  };

  // Run a field definition through all available compilers.
  compiler.compileDef = function (def) {

    def = util.deepCopy(def);

    var result;
    compilerPlugins.forEach(function (plugin) {
      result = plugin.compile(def);
      if (result) {
        def = result;
      }
    });

    var typePlugin = plugin.require('type.' + def.type);

    if (typePlugin.compile) {
      result = typePlugin.compile(def);
      if (result) {
        def = result;
      }
    }

    return def;
  };

  // For an array of field definitions, compile each field definition.
  compiler.compileFields = function (fields) {
    return fields.map(function (field) {
      return compiler.compileDef(field);
    });
  };
};

'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (f, plugin) {

  f.isBlank = function (value) {
    return value === undefined || value === null && value === '';
  };

  f.form.init = function (options) {
    var form = this;

    form.actions = Reflux.createActions(['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue']);
    form.store = f.plugin('stores.memory').create(form.actions, form, options);
    form.store.inflate();
  };

  f.form.component = function () {

    var form = this;

    var component = f.plugin('components.formatic').component;

    return component({
      form: form
    });
  };

  f.form.field = function () {
    var form = this;

    return f.field(form, {
      type: 'root'
    }, form.store.value);
  };

  f.form.val = function (value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setValue(value);
    }

    return f.copyValue(form.store.value);
  };

  f.form.fields = function (fields) {
    var form = this;

    form.actions.setFields(fields);
  };

  f.form.findDef = function (key) {
    var form = this;

    return _.find(form.store.fields, function (def) {
      return def.id === key || def.key === key;
    });
  };

  f.setIn = function (obj, path, value) {
    if (path.length === 0) {
      return value;
    }
    if (path.length === 1) {
      obj[path[0]] = value;
      return obj;
    }
    if (!obj[path[0]]) {
      obj[path[0]] = {};
    }
    f.setIn(obj[path[0]], path.slice(1), value);
    return obj;
  };

  f.removeIn = function (obj, path) {
    if (path.length === 0) {
      return null;
    }
    if (path.length === 1) {
      if (_.isArray(obj)) {
        if (_.isNumber(path[0])) {
          obj.splice(path[0], 1);
        }
      } else if (_.isObject(obj)) {
        delete obj[path[0]];
      }
      return obj;
    }
    if (obj[path[0]]) {
      f.removeIn(obj[path[0]], path.slice(1));
    }
    return obj;
  };

  f.appendIn = function (obj, path, value) {
    if (path.length === 0) {
      if (_.isArray(obj)) {
        obj.push(value);
      }
      return obj;
    }
    if (obj[path[0]]) {
      f.appendIn(obj[path[0]], path.slice(1), value);
    }
    return obj;
  };

  f.copyValue = function (value) {
    return JSON.parse(JSON.stringify(value));
  };

  f.defaultValue = function (field) {

    if (!_.isUndefined(field.def.value)) {
      return f.copyValue(field.def.value);
    }

    if (!_.isUndefined(field.def.default)) {
      return f.copyValue(field.def.default);
    }

    var typePlugin = f.plugin('types.' + field.def.type);

    if (!_.isUndefined(typePlugin.default)) {
      return f.copyValue(typePlugin.default);
    }

    return null;
  };

  f.deepCopy = function (obj) {
    if (_.isArray(obj)) {
      return obj.map(function (item) {
        return f.deepCopy(item);
      });
    } else if (_.isObject(obj)) {
      var copy = {};
      _.each(obj, function (value, key) {
        copy[key] = f.deepCopy(value);
      });
      return copy;
    } else {
      return obj;
    }
  };

  f.compilers = [];

  f.compiler = function (compile) {
    f.compilers.push(compile);
  };

  f.compile = function (def) {
    //def = f.deepCopy(def);
    def = _.extend({}, def);
    var result;
    f.compilers.forEach(function (compile) {
      result = compile(def);
      if (result) {
        def = result;
      }
    });

    var typePlugin = f.plugin('types.' + def.type);

    if (typePlugin.compile) {
      result = typePlugin.compile(def);
      if (result) {
        def = result;
      }
    }

    return def;
  };

  f.itemMatchesValue = function (item, value) {
    var match = item.match;
    if (!match) {
      return true;
    }
    return _.every(_.keys(match), function (key) {
      return _.isEqual(match[key], value[key]);
    });
  };

  f.fieldDefFromValue = function (value) {
    var def = {
      type: 'json'
    };
    if (_.isString(value)) {
      def = {
        type: 'string'
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var childDef = f.fieldDefFromValue(value);
        childDef.key = i;
        return childDef;
      });
      def = {
        type: 'array',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var childDef = f.fieldDefFromValue(value[key]);
        childDef.key = key;
        childDef.label = f.humanize(key);
        return childDef;
      });
      def = {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      def = {
        type: 'null'
      };
    }
    return def;
  };

  // compilers

  f.compiler(function (def) {
    if (def.choices) {

      var choices = def.choices;

      if (_.isString(choices)) {
        choices = choices.split(',');
      }

      if (!_.isArray(choices) && _.isObject(choices)) {
        choices = Object.keys(choices).map(function (key) {
          return {
            value: key,
            label: choices[key]
          };
        });
      }

      choices.forEach(function (choice, i) {
        if (_.isString(choice)) {
          choices[i] = {
            value: choice,
            label: choice
          };
        }
      });

      def.choices = choices;
    }
  });

  // fields

  var Field = function (form, def, value, parent) {
    var field = this;

    field.form = form;
    field.def = def;
    field.value = value;
    field.parent = parent;

    field._typePlugin = null;
  };

  f.field = function (form, def, value, parent) {
    return new Field(form, def, value, parent);
  };

  Field.prototype = f.field;

  f.field.typePlugin = function () {
    var field = this;

    if (!field._typePlugin) {
      field._typePlugin = f.plugin('types.' + field.def.type);
    }

    return field._typePlugin;
  };

  f.field.component = function () {
    var field = this;
    var component = f.componentForField(field);
    return component({
      field: field
    });
  };

  f.field.fields = function () {
    var field = this;

    var fields;
    if (field.typePlugin().fields) {
      fields = field.typePlugin().fields(field);
    } else if (field.def.fields) {
      fields = field.def.fields.map(function (def) {
        return field.createChild(def);
      });
    } else {
      fields = [];
    }
    return fields;
  };

  f.field.resolve = function (def) {
    var field = this;

    if (_.isString(def)) {
      def = field.form.findDef(def);
      if (!def) {
        throw new Error('Could not find field: ' + def);
      }
    }

    var ext = def.extends;

    if (_.isString(ext)) {
      ext = [ext];
    }

    if (ext) {
      var bases = ext.map(function (base) {
        return field.form.findDef(base);
      });

      var chain = [{}].concat(bases.reverse().concat([def]));

      def = _.extend.apply(_, chain);
    }

    if (def.items) {
      def.items = def.items.map(function (item) {
        return field.resolve(item);
      });
    }

    return f.compile(def);
  };

  f.field.createChild = function (def) {
    var field = this;

    def = field.resolve(def);

    var value = field.value;

    if (!f.isBlank(def.key)) {
      if (value && !_.isUndefined(value[def.key])) {
        value = value[def.key];
      } else {
        value = undefined;
      }
    }

    return f.field(field.form, def, value, field);
  };

  f.field.itemForValue = function (value) {
    var field = this;

    var items = field.def.items;
    var item;
    if (items) {
      item = _.find(items, function (item) {
        return f.itemMatchesValue(item, value);
      });
      item = _.extend(item);
    }
    if (!item) {
      item = f.fieldDefFromValue(value);
    }
    return item;
  };

  f.field.valuePath = function (childPath) {
    var field = this;

    var path = childPath || [];
    if (!f.isBlank(field.def.key)) {
      path = [field.def.key].concat(path);
    }
    if (field.parent) {
      return field.parent.valuePath(path);
    }
    return path;
  };

  f.field.val = function (value) {
    var field = this;

    field.form.actions.setValue(field.valuePath(), value);
  };

  f.field.remove = function (key) {
    var field = this;

    var path = field.valuePath().concat(key);

    field.form.actions.removeValue(path);
  };

  f.field.append = function (itemIndex) {
    var field = this;

    var item = field.def.items[itemIndex];
    item = _.extend(item);

    item.key = field.value.length;

    var child = field.createChild(item);

    var obj = f.defaultValue(child);

    if (_.isArray(obj) || _.isObject(obj)) {
      var chop = field.valuePath().length + 1;

      child.inflate(function (path, value) {
        obj = f.setIn(obj, path.slice(chop), value);
      });
    }

    field.form.actions.appendValue(field.valuePath(), obj);
  };

  f.field.hidden = function () {
    var field = this;

    return field.def.hidden || field.typePlugin().hidden;
  };

  // expand all fields and seed values if necessary
  f.field.inflate = function (onSetValue) {
    var field = this;

    if (!f.isBlank(field.def.key) && _.isUndefined(field.value)) {
      onSetValue(field.valuePath(), f.defaultValue(field));
    }

    var fields = field.fields();

    fields.forEach(function (child) {
      child.inflate(onSetValue);
    });
  };

  f.field.erase = function () {
    var field = this;

    if (!f.isBlank(field.def.key) && !_.isUndefined(field.value)) {
      field.form.actions.removeValue(field.valuePath());
    }
  };

  // views

  f.render = function (component, node) {

    React.renderComponent(component, node);
  };

  var routes = {};

  f.route = function (typeName, componentName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      component: componentName,
      test: testFn
    });
  };

  f.componentForField = function (field) {

    var typeName = field.def.type;

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return f.plugin('components.' + route.component).component;
      }
    }

    if (f.hasPlugin('components.' + typeName)) {
      return f.plugin('components.' + typeName).component;
    }

    throw new Error('No component for field: ' + JSON.stringify(field.def));
  };

  f.component = function (name) {
    return f.plugin('components.' + name).component;
  };

  // utility

  f.className = function () {

    var classNames = Array.prototype.slice.call(arguments, 0);

    classNames = classNames.filter(function (name) {
      return name;
    });

    return classNames.join(' ');
  };

  // routes

  f.route('object', 'fieldset');
  f.route('string', 'select', function (field) {
    return field.def.choices ? true : false;
  });
  f.route('string', 'text', function (field) {
    return field.def.maxRows === 1;
  });
  f.route('string', 'textarea');
  f.route('array', 'checkbox-list', function (field) {
    return field.def.choices ? true : false;
  });
  f.route('array', 'list');
  f.route('boolean', 'select');

};

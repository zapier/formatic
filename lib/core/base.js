'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  formatic.form.init = function (options) {
    var form = this;

    form.actions = Reflux.createActions(['setValue', 'setFields', 'removeValue']);
    form.store = formatic.plugin('stores.memory').create(form.actions, form, options);
    form.store.inflate();
  };

  formatic.form.component = function () {

    var form = this;

    var component = formatic.plugin('components.formatic').component;

    return component({
      form: form
    });
  };

  formatic.form.field = function () {
    var form = this;

    return formatic.field(form, {
      type: 'root'
    }, form.store.value);
  };

  formatic.form.val = function (value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setValue(value);
    }

    return formatic.copyValue(form.store.value);
  };

  formatic.form.fields = function (fields) {
    var form = this;

    form.actions.setFields(fields);
  };

  formatic.form.findDef = function (key) {
    var form = this;

    return _.find(form.store.fields, function (def) {
      return def.id === key || def.key === key;
    });
  };

  formatic.setIn = function (obj, path, value) {
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
    formatic.setIn(obj[path[0]], path.slice(1), value);
    return obj;
  };

  formatic.removeIn = function (obj, path) {
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
      formatic.removeIn(obj[path[0]], path.slice(1));
    }
    return obj;
  };

  formatic.copyValue = function (value) {
    return JSON.parse(JSON.stringify(value));
  };

  formatic.defaultValue = function (field) {

    var typePlugin = formatic.plugin('types.' + field.def.type);

    if (!_.isUndefined(typePlugin.default)) {
      return formatic.copyValue(typePlugin.default);
    }

    if (!_.isUndefined(field.def.default)) {
      return formatic.copyValue(field.def.default);
    }

    return null;
  };

  formatic.deepCopy = function (obj) {
    if (_.isArray(obj)) {
      return obj.map(function (item) {
        return formatic.deepCopy(item);
      });
    } else if (_.isObject(obj)) {
      var copy = {};
      _.each(obj, function (value, key) {
        copy[key] = formatic.deepCopy(value);
      });
      return copy;
    } else {
      return obj;
    }
  };

  formatic.compilers = [];

  formatic.compiler = function (compile) {
    formatic.compilers.push(compile);
  };

  formatic.compile = function (def) {
    //def = formatic.deepCopy(def);
    def = _.extend({}, def);
    var result;
    formatic.compilers.forEach(function (compile) {
      result = compile(def);
      if (result) {
        def = result;
      }
    });

    var typePlugin = formatic.plugin('types.' + def.type);

    if (typePlugin.compile) {
      result = typePlugin.compile(def);
      if (result) {
        def = result;
      }
    }

    return def;
  };

  // compilers

  formatic.compiler(function (def) {
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
  };

  formatic.field = function (form, def, value, parent) {
    return new Field(form, def, value, parent);
  };

  Field.prototype = formatic.field;

  formatic.field.component = function () {
    var field = this;
    var component = formatic.componentForField(field);
    return component({
      field: field
    });
  };

  formatic.field.fields = function () {
    var field = this;

    var typePlugin = formatic.plugin('types.' + field.def.type);

    var fields;
    if (typePlugin.fields) {
      fields = typePlugin.fields(field);
    } else if (field.def.fields) {
      fields = field.def.fields.map(function (def) {
        return field.createChild(def);
      });
    } else {
      fields = [];
    }
    return fields;
  };

  formatic.field.resolve = function (def) {
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

      def = _.extend.apply(_, [{}, def].concat(bases));
    }

    return formatic.compile(def);
  };

  formatic.field.createChild = function (def) {
    var field = this;

    def = field.resolve(def);

    var value = field.value;

    if (!_.isUndefined(def.key)) {
      if (value && !_.isUndefined(value[def.key])) {
        value = value[def.key];
      } else {
        value = undefined;
      }
    }

    return formatic.field(field.form, def, value, field);
  };

  formatic.field.valuePath = function (childPath) {
    var field = this;

    var path = childPath || [];
    if (field.def.key) {
      path = [field.def.key].concat(path);
    }
    if (field.parent) {
      return field.parent.valuePath(path);
    }
    return path;
  };

  formatic.field.val = function (value) {
    var field = this;

    field.form.actions.setValue(field.valuePath(), value);
  };

  // expand all fields and seed values if necessary
  formatic.field.inflate = function (onSetValue) {
    var field = this;

    if (field.def.key && field.value === undefined) {
      onSetValue(field.valuePath(), formatic.defaultValue(field));
    }

    var fields = field.fields();

    fields.forEach(function (child) {
      child.inflate(onSetValue);
    });
  };

  formatic.field.erase = function () {
    var field = this;

    if (field.def.key && field.value !== undefined) {
      field.form.actions.removeValue(field.valuePath());
    }
  };

  // views

  formatic.render = function (component, node) {

    React.renderComponent(component, node);
  };

  var routes = {};

  formatic.route = function (typeName, componentName, testFn) {
    if (!routes[typeName]) {
      routes[typeName] = [];
    }
    routes[typeName].push({
      component: componentName,
      test: testFn
    });
  };

  formatic.componentForField = function (field) {

    var typeName = field.def.type;

    if (routes[typeName]) {
      var routesForType = routes[typeName];
      var route = _.find(routesForType, function (route) {
        return !route.test || route.test(field);
      });
      if (route) {
        return formatic.plugin('components.' + route.component).component;
      }
    }

    if (formatic.hasPlugin('components.' + typeName)) {
      return formatic.plugin('components.' + typeName).component;
    }

    throw new Error('No component for field: ' + JSON.stringify(field.def));
  };

  formatic.component = function (name) {
    return formatic.plugin('components.' + name).component;
  };

  // utility

  formatic.className = function () {

    var classNames = Array.prototype.slice.call(arguments, 0);

    classNames = classNames.filter(function (name) {
      return name;
    });

    return classNames.join(' ');
  };

  // routes

  formatic.route('object', 'fieldset');
  formatic.route('string', 'select', function (field) {
    return field.def.choices ? true : false;
  });
  formatic.route('string', 'text', function (field) {
    return field.def.maxRows === 1;
  });
  formatic.route('string', 'textarea');
  formatic.route('array', 'checkbox-list', function (field) {
    return field.def.choices ? true : false;
  });
  formatic.route('array', 'list');
  formatic.route('boolean', 'select');

};

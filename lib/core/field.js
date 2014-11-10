// # core.field

/*
The core field plugin provides the Field prototype. Fields represent a
particular state in time of a field definition, and they provide helper methods
to notify the form store of changes.

Fields are lazily created and evaluated, but once evaluated, they should be
considered immutable.
*/

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var router = plugin.require('field-router');
  var util = plugin.require('util');
  var evaluator = plugin.require('eval');
  var compiler = plugin.require('compiler');

  // The Field constructor.
  var Field = function (form, def, value, parent) {
    var field = this;

    field.form = form;
    field.def = def;
    field.value = value;
    field.parent = parent;
  };

  // Attach a field factory to the form prototype.
  plugin.exports.field = function () {
    var form = this;

    return new Field(form, {
      type: 'root'
    }, form.store.value);
  };

  var proto = Field.prototype;

  // Return the type plugin for this field.
  proto.typePlugin = function () {
    var field = this;

    if (!field._typePlugin) {
      field._typePlugin = plugin.require('type.' + field.def.type);
    }

    return field._typePlugin;
  };

  // Get a component for this field.
  proto.component = function () {
    var field = this;
    var component = router.componentForField(field);
    return component({
      field: field
    });
  };

  // Get the child fields for this field.
  proto.fields = function () {
    var field = this;

    if (!field._fields) {
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
      field._fields = fields;
    }

    return field._fields;
  };

  // Get the items (child field definitions) for this field.
  proto.items = function () {
    var field = this;

    if (!field._items) {
      if (_.isArray(field.def.items)) {
        field._items = field.def.items.map(function (item) {
          return field.resolve(item);
        });
      } else {
        field._items = [];
      }
    }

    return field._items;
  };

  // Resolve a field reference if necessary.
  proto.resolve = function (def) {
    var field = this;

    if (_.isString(def)) {
      def = field.form.findDef(def);
      if (!def) {
        throw new Error('Could not find field: ' + def);
      }
    }

    return def;
  };

  // Evaluate a field definition and return a new field definition.
  proto.evalDef = function (def) {
    var field = this;

    if (def.eval) {

      try {
        var extDef = field.eval(def.eval);
        if (extDef) {
          def = _.extend({}, def, extDef);
          def = compiler.compileDef(def);
        }
      } catch (e) {
        console.log('Problem in eval: ', JSON.stringify(def.eval));
        console.log(e.message);
      }
    }

    return def;
  };

  // Evaluate an expression in the context of a field.
  proto.eval = function (expression) {
    return evaluator.evaluate(expression, this);
  };

  // Create a child field from a definition.
  proto.createChild = function (def) {
    var field = this;

    def = field.resolve(def);

    var value = field.value;

    def = field.evalDef(def);

    if (!util.isBlank(def.key)) {
      if (value && !_.isUndefined(value[def.key])) {
        value = value[def.key];
      } else {
        value = undefined;
      }
    } else {
      value = def.value;
    }

    return new Field(field.form, def, value, field);
  };

  // Given a value, find an appropriate field definition for this field.
  proto.itemForValue = function (value) {
    var field = this;

    var item = _.find(field.items(), function (item) {
      return util.itemMatchesValue(item, value);
    });
    if (item) {
      item = _.extend({}, item);
    } else {
      item = util.fieldDefFromValue(value);
    }

    return item;
  };

  // Walk backwards through parents and build out a path array to the value.
  proto.valuePath = function (childPath) {
    var field = this;

    var path = childPath || [];
    if (!util.isBlank(field.def.key)) {
      path = [field.def.key].concat(path);
    }
    if (field.parent) {
      return field.parent.valuePath(path);
    }
    return path;
  };

  // Set the value for this field.
  proto.val = function (value) {
    var field = this;

    field.form.actions.setValue(field.valuePath(), value);
  };

  // Remove a child value from this field.
  proto.remove = function (key) {
    var field = this;

    var path = field.valuePath().concat(key);

    field.form.actions.removeValue(path);
  };

  // Move a child value from one key to another.
  proto.move = function (fromKey, toKey) {
    var field = this;

    field.form.actions.moveValue(field.valuePath(), fromKey, toKey);
  };

  // Get the default value for this field.
  proto.default = function () {
    var field = this;

    if (!_.isUndefined(field.def.value)) {
      return util.copyValue(field.def.value);
    }

    if (!_.isUndefined(field.def.default)) {
      return util.copyValue(field.def.default);
    }

    if (!_.isUndefined(field.typePlugin().default)) {
      return util.copyValue(field.typePlugin().default);
    }

    return null;
  };

  // Append a new value. Use the `itemIndex` to get an appropriate
  // item, inflate it, and create a default value.
  proto.append = function (itemIndex) {
    var field = this;

    var item = field.items()[itemIndex];
    item = _.extend(item);

    item.key = field.value.length;

    var child = field.createChild(item);

    var obj = child.default();

    if (_.isArray(obj) || _.isObject(obj)) {
      var chop = field.valuePath().length + 1;

      child.inflate(function (path, value) {
        obj = util.setIn(obj, path.slice(chop), value);
      });
    }

    field.form.actions.appendValue(field.valuePath(), obj);
  };

  // Determine whether the field is hidden.
  proto.hidden = function () {
    var field = this;

    return field.def.hidden || field.typePlugin().hidden;
  };

  // Expand all child fields and call the setter function with the default
  // values at each path.
  proto.inflate = function (onSetValue) {
    var field = this;

    if (!util.isBlank(field.def.key) && _.isUndefined(field.value)) {
      onSetValue(field.valuePath(), field.default());
    }

    var fields = field.fields();

    fields.forEach(function (child) {
      child.inflate(onSetValue);
    });
  };

  // Called from unmount. When fields are removed for whatever reason, we
  // should delete the corresponding value.
  proto.erase = function () {
    var field = this;
    if (!util.isBlank(field.def.key) && !_.isUndefined(field.value)) {
      field.form.actions.eraseValue(field.valuePath(), {});
    }
  };
};

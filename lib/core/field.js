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
    field.groups = {};
    field.tempChildren = [];
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
      field._typePlugin = null;
      try {
        field._typePlugin = plugin.require('type.' + field.def.type);
      } catch (e) {
        console.log('Problem trying to load type plugin.');
        console.log('Field definition:');
        console.log(JSON.stringify(field.def, null, 2));
        console.log(field.valuePath());
        console.log(e.stack);
      }
      if (!field._typePlugin) {
        field._typePlugin = {};
      }
    }

    return field._typePlugin;
  };

  // Get a component for this field.
  proto.component = function (props) {
    var field = this;
    props = _.extend({}, props, {field: field});
    var component = router.componentForField(field);
    return component(props);
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
          if (def.fields) {
            def.fields = def.fields.map(function (childDef) {
              childDef = compiler.expandDef(childDef, field.form.store.templateMap);
              return compiler.compileDef(childDef);
            });
          }
          def = compiler.compileDef(def);
        }
      } catch (e) {
        console.log('Problem in eval: ', JSON.stringify(def.eval));
        console.log(e.message);
        console.log(e.stack);
      }
    }

    return def;
  };

  // Evaluate an expression in the context of a field.
  proto.eval = function (expression, context) {
    return evaluator.evaluate(expression, this, context);
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

    if (!def.type) {
      var typeDef = util.fieldDefFromValue(value);
      def = _.extend({}, def);
      def.type = typeDef.type;
      def = compiler.compileDef(def);
    }

    var childField = new Field(field.form, def, value, field);

    field.tempChildren.push(childField);

    return childField;

    // if (def.eval) {
    //   def = childField.evalDef(def);
    //   if (util.isBlank(def.key)) {
    //     value = def.value;
    //   }
    //   childField = new Field(field.form, def, value, field);
    // }
    //
    // return childField;
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

  // Get all the fields belonging to a group.
  proto.groupFields = function (groupName, ignoreTempChildren) {
    var field = this;

    if (!field.groups[groupName]) {
      field.groups[groupName] = [];

      if (field.parent) {
        var siblings = field.parent.fields();
        siblings.forEach(function (sibling) {
          if (sibling !== field && sibling.def.group === groupName) {
            field.groups[groupName].push(sibling);
          }
        });
        var parentGroupFields = field.parent.groupFields(groupName, true);
        field.groups[groupName] = field.groups[groupName].concat(parentGroupFields);
      }
    }

    if (!ignoreTempChildren && field.groups[groupName].length === 0) {
      // looking at children so far
      var childGroupFields = [];
      field.tempChildren.forEach(function (child) {
        if (child.def.group === groupName) {
          childGroupFields.push(child);
        }
      });
      return childGroupFields;
    }

    return field.groups[groupName];
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
    if (item) {
      item = _.extend(item);
    } else {
      // Fallback to a string field. Or should we fallback to json???
      item = {
        type: 'string'
      };
    }

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

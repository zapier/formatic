'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var router = plugin.require('field-router');
  var util = plugin.require('util');
  //var compiler = plugin.require('compiler');

  var Field = function (form, def, value, parent) {
    var field = this;

    field.form = form;
    field.def = def;
    field.value = value;
    field.parent = parent;
  };

  plugin.exports.field = function () {
    var form = this;

    return new Field(form, {
      type: 'root'
    }, form.store.value);
  };

  var proto = Field.prototype;

  proto.typePlugin = function () {
    var field = this;

    if (!field._typePlugin) {
      field._typePlugin = plugin.require('type.' + field.def.type);
    }

    return field._typePlugin;
  };

  proto.component = function () {
    var field = this;
    var component = router.componentForField(field);
    return component({
      field: field
    });
  };

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

  proto.resolve = function (def) {
    var field = this;

    if (_.isString(def)) {
      def = field.form.findDef(def);
      if (!def) {
        throw new Error('Could not find field: ' + def);
      }
    }

    return def;

    // if (_.isString(def)) {
    //   def = field.form.findDef(def);
    //   if (!def) {
    //     throw new Error('Could not find field: ' + def);
    //   }
    // }
    //
    // var ext = def.extends;
    //
    // if (_.isString(ext)) {
    //   ext = [ext];
    // }
    //
    // if (ext) {
    //   var bases = ext.map(function (base) {
    //     return field.form.findDef(base);
    //   });
    //
    //   var chain = [{}].concat(bases.reverse().concat([def]));
    //
    //   def = _.extend.apply(_, chain);
    // } else {
    //   def = _.extend({}, def);
    // }
    //
    // if (def.items) {
    //   def.items = def.items.map(function (item) {
    //     return field.resolve(item);
    //   });
    // }
    //
    // // if (def.eval) {
    // //   def = field.eval(def);
    // // }
    //
    // return compiler.compile(def);
  };

  // proto.eval = function (def) {
  //   var field = this;
  //
  //   if (def.eval) {
  //     if (_.isObject(def.eval)) {
  //       _.each(def.eval, function (evalRule, evalKey) {
  //         var result = field.evalRule(evalRule);
  //       });
  //     }
  //   }
  //   return def;
  // };
  //
  // proto.evalRule = function (rule) {
  //   var field = this;
  //
  //   if (_.isString(rule)) {
  //     var lookup = function () {
  //       var args = _.toArray(arguments);
  //       if (args.length === _.compact(args).length) {
  //         var metaKey = args.join('::');
  //         if (meta[metaKey]) {
  //           return meta[metaKey];
  //         } else {
  //           form.pushNeedsKey(metaKey);
  //         }
  //       }
  //     };
  //
  //   }
  // };

/*
  formatic.runField = function (form, fieldState, valueState, meta, context, nextContext) {
    if (!fieldState.get('eval')) {
      return fieldState;
    }
    return fieldState.withMutations(function (fieldState) {
      var evalRules = fieldState.get('eval');
      if (evalRules instanceof Immutable.Map) {
        evalRules.keySeq().forEach(function (evalKey) {
          var evalRule = evalRules.get(evalKey);
          var result = formatic.runFieldRule(form, evalRule, fieldState, valueState, meta, context, nextContext);
          if (result !== '' && typeof result !== 'undefined' && result !== null) {
            fieldState.set(evalKey, formatic.fromJS(result));
          }
        });
      }
    });
  };

  formatic.runFieldRule = function (form, rule, fieldState, valueState, meta, context, nextContext) {
    if (_.isString(rule)) {
      try {
        var lookup = function () {
          var args = _.toArray(arguments);
          if (args.length === _.compact(args).length) {
            var metaKey = args.join('::');
            if (meta[metaKey]) {
              return meta[metaKey];
            } else {
              form.pushNeedsKey(metaKey);
            }
          }
        };
        // TODO: some caching here!!!
        var fn = funql.toFunction(rule, {lookup: lookup});
        var result = fn(nextContext.vars);
        return result;
      } catch (e) {
        console.log('Problem evaluating: ' + e);
      }
    }
  };
*/


  proto.createChild = function (def) {
    var field = this;

    def = field.resolve(def);

    var value = field.value;

    if (!util.isBlank(def.key)) {
      if (value && !_.isUndefined(value[def.key])) {
        value = value[def.key];
      } else {
        value = undefined;
      }
    }

    return new Field(field.form, def, value, field);
  };

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

  proto.val = function (value) {
    var field = this;

    field.form.actions.setValue(field.valuePath(), value);
  };

  proto.remove = function (key) {
    var field = this;

    var path = field.valuePath().concat(key);

    field.form.actions.removeValue(path);
  };

  proto.move = function (fromKey, toKey) {
    var field = this;

    field.form.actions.moveValue(field.valuePath(), fromKey, toKey);
  };

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

  proto.hidden = function () {
    var field = this;

    return field.def.hidden || field.typePlugin().hidden;
  };

  // expand all fields and seed values if necessary
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

  // Called from unmount.
  proto.erase = function () {
    var field = this;
    if (!util.isBlank(field.def.key) && !_.isUndefined(field.value)) {
      field.form.actions.eraseValue(field.valuePath(), {});
    }
  };
};

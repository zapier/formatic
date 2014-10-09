'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');
var Immutable = require('immutable');
var funql = require('funql');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {
    return next();
  });

  formatic.formStatePath = function (field) {
    var path = field;
    if (!_.isArray(field)) {
      path = field._path;
    }
    path = path.map(function (index) {
      return ['fields', index];
    });
    path = _.flatten(path);
    return path;
  };

  formatic.ensureValuePath = function (formState, field) {

  };

  formatic.setValueOfField = function (valueState, field, value) {
    var path = field.valueStatePath().concat('value');
    return valueState.updateIn(path, function () {
      return formatic.wrapValue(value).value;
    });
  };

  formatic.incrementViewKey = function (valueState, path) {
    var wrappedValue = valueState.getIn(path);
    var viewKey = wrappedValue.get('nextViewKey');
    viewKey++;
    return valueState.updateIn(path, function (wrappedValue) {
      return wrappedValue.set('nextViewKey', viewKey);
    });
  };

  formatic.nextViewKey = function (valueState, path) {
    var wrappedValue = valueState.getIn(path);
    return wrappedValue.get('nextViewKey');
  };

  formatic.appendField = function (valueState, field, itemIndex) {
    var wrapperPath = field.valueStatePath();
    var nextViewKey = formatic.nextViewKey(valueState, wrapperPath);
    valueState = formatic.incrementViewKey(valueState, wrapperPath);
    var path = wrapperPath.concat('value');
    var item = field.itemState(itemIndex);
    var fieldStates = field.parentFieldStates();
    fieldStates = fieldStates.concat(field._fieldState);
    var context = formatic.buildEvalContext(fieldStates);
    item = item.set('key', 0);
    var fieldState = formatic.evalField(field._form, item, null, {}, context);
    var value = formatic.valueOfFieldState(fieldState);
    var fatValue = formatic.wrapValue(value);
    fatValue.viewKey = nextViewKey;
    return valueState.updateIn(path, function (values) {
      return values.push(formatic.fromJS(fatValue));
    });
  };

  formatic.removeField = function (valueState, field, index) {

    var path = field.valueStatePath().concat('value');
    return valueState.updateIn(path, function (values) {
      return values.splice(index, 1).toVector();
    });
  };

  formatic.moveField = function (valueState, field, fromKeyOrIndex, toKeyOrIndex) {

    var path = field.valueStatePath().concat('value');

    if (_.isNumber(fromKeyOrIndex) && _.isNumber(toKeyOrIndex)) {
      var fromIndex = fromKeyOrIndex;
      var toIndex = toKeyOrIndex;

      var values = valueState.getIn(path);

      if (fromIndex !== toIndex &&
        fromIndex >= 0 && fromIndex < values.length &&
        toIndex >= 0 && toIndex < values.length
      ) {
        return valueState.updateIn(path, function (values) {
          var removedValue = values.get(fromIndex);
          values = values.splice(fromIndex, 1).toVector();
          values = values.splice(toIndex, 0, removedValue).toVector();
          return values;
        });
      }
    }


    // var path = formatic.formStatePath(field);
    //
    // if (_.isNumber(fromKeyOrIndex) && _.isNumber(toKeyOrIndex)) {
    //   var fromIndex = fromKeyOrIndex;
    //   var toIndex = toKeyOrIndex;
    //
    //   var fields = formState.get('fields');
    //
    //   if (fields) {
    //     if (fromIndex !== toIndex &&
    //       fromIndex >= 0 && fromIndex < fields.length &&
    //       toIndex >= 0 && toIndex < fields.length
    //     ) {
    //       return formState.updateIn(path.concat('fields'), function (fields) {
    //         var removedField = fields.get(fromIndex);
    //         fields = fields.splice(fromIndex, 1);
    //         fields = fields.splice(toIndex, 0, removedField);
    //         return fields;
    //       });
    //     }
    //   }
    // }

    // TODO: move keys

    return valueState;
  };

  formatic.formToJS = function (form) {
    if (form._hasDirtyValue) {
      form._jsForm = form._formState.toJS();
    }
    return form._jsForm;
  };

  formatic.getFormValue = function (form) {
    if (form._currentValue === undefined || form._currentValue === null) {
      return null;
    }
    return formatic.unwrapValue(form._currentValue.toJS());
  };

  formatic.valueOfFieldState = function (fieldState) {

    var typePlugin = formatic.type(fieldState.get('type'));

    if (typePlugin.getFieldValue) {
      return typePlugin.getFieldValue(fieldState);
    }

    if (fieldState.has('value')) {
      return fieldState.get('value');
    }
    if (!fieldState.has('default')) {
      return null;
    }
    return fieldState.get('default');
  };

  formatic.getFieldValue = function (fieldState) {

    var typePlugin = formatic.type(fieldState.get('type'));

    if (typePlugin.getFieldValue) {
      return typePlugin.getFieldValue(fieldState);
    }

    if (fieldState.has('value')) {
      return formatic.toJS(fieldState.get('value'));
    }
    if (!fieldState.has('default')) {
      return null;
    }
    return formatic.toJS(fieldState.get('default'));
  };

  formatic.wrapValue = function (value) {
    if (_.isArray(value)) {
      return {
        nextViewKey: value.length,
        value: value.map(function (child, i) {
          var fatValue = formatic.wrapValue(child);
          fatValue.viewKey = i;
          return fatValue;
        })
      };
    } else if (_.isObject(value)) {
      var obj = {};
      Object.keys(value).forEach(function (key, i) {
        obj[key] = formatic.wrapValue(value[key]);
        obj[key].viewKey = i;
      });
      return {
        nextViewKey: Object.keys(value).length,
        value: obj
      };
    } else {
      return {
        value: value
      };
    }
  };

  formatic.unwrapValue = function (wrappedValue) {
    var value = wrappedValue.value;
    if (_.isArray(value)) {
      return value.map(function (child) {

        return formatic.unwrapValue(child);
      });
    } else if (_.isObject(value)) {
      var obj = {};
      _.each(value, function (child, key) {
        obj[key] = formatic.unwrapValue(child);
      });
      return obj;
    } else {
      return value;
    }
  };

  // formatic.modifyFormValue = function (form, value) {
  //   var field = formatic.formToJS(form);
  //   formatic.modifyFieldValue(field, value);
  //   form._formActions.set
  // };
  //
  // formatic.modifyFieldValue = function (field, value) {
  //   var typePlugin = formatic.type(field.type);
  //
  //   if (typePlugin.modifyFieldValue) {
  //     typePlugin.modifyFieldValue(field, value);
  //     return;
  //   }
  //
  //   field.value = value;
  // };

  formatic.setFormValue = function (form, value) {
    form._formActions.setFormValue(value);
  };

  formatic.setFieldValue = function (formState, value, templateMap) {
    var type = formState.get('type');
    var typePlugin = formatic.type(type);

    if (typePlugin.setFieldValue) {
      return typePlugin.setFieldValue(formState, value, templateMap);
    }

    return formState.set('value', formatic.fromJS(value));
  };

  formatic.form.val = function (value) {
    if (typeof value === 'undefined') {
      return formatic.getFormValue(this);
    }
    return formatic.setFormValue(this, value);
  };

  formatic.setMetaValue = function (form, key, value) {
    form._metaActions.setItem(key, value);
  };

  formatic.form.meta = function (key, value) {
    return formatic.setMetaValue(this, key, value);
  };

  formatic.matchesKey = function (key, formState) {
    if (formState.get('id') && formState.get('id') === key) {
      return true;
    }
    if (formState.get('key') && formState.get('key') === key) {
      return true;
    }
    return false;
  };

  formatic.findAroundField = function (key, formState, rootFormState, path) {
    var parentPath = path.slice(0, path.length - 1);

    if (parentPath.length === 0) {
      return null;
    }

    var parentStatePath = formatic.formStatePath(parentPath);

    var parent = rootFormState.getIn(parentStatePath);

    var siblings = parent.get('fields').toArray();

    var matchingSibling = null;

    _.find(siblings, function (sibling) {
      if (sibling !== formState) {
        matchingSibling = formatic.findInField(key, sibling);
        return matchingSibling;
      }
    });

    if (matchingSibling) {
      return matchingSibling;
    }

    return formatic.findAroundField(key, parent, rootFormState, parentPath);
  };

  formatic.findInField = function (key, formState) {
    if (formatic.matchesKey(key, formState)) {
      return formState;
    }
    if (formState.get('fields')) {
      formState.get('fields').forEach(function (child) {
        return formatic.findInField(key, child);
      });
    }
    return null;
  };

  formatic.getInData = function (data, keys) {
    if (!_.isArray(keys)) {
      keys = [keys];
    }
    if (keys.length === 0) {
      return data;
    }
    if (data[keys[0]]) {
      return formatic.getInData(data[keys[0]], keys.slice(1));
    }
  };

  formatic.lookupKey = function (formState, rootFormState, path, lookup) {
    var args = lookup.map(function (arg) {
      if (arg[0] === '=') {
        var fieldId = arg.slice(1);
        var field = formatic.findAroundField(fieldId, formState, rootFormState, path);
        if (field) {
          return field.get('value');
        } else {
          return null;
        }
      }
      return arg;
    });
    var hasAllArgs = _.every(args, function (arg) {
      return arg;
    });
    if (hasAllArgs) {
      return args.join('::');
    }
    return null;
  };

  formatic.updateData = function (formState, data, rootFormState, path) {
    rootFormState = rootFormState || formState;
    path = path || [];
    return formState.withMutations(function (field) {
      if (field.get('eval')) {
        field.get('eval').keySeq().forEach(function (propKey) {
          if (propKey === 'eval') {
            throw new Error("Can't eval value of eval property.");
          }
          var fallbackPropKey = '__fallback__' + propKey;
          if (!field.get(fallbackPropKey)) {
            if (field.has(propKey)) {
              field.set(fallbackPropKey, field.get(propKey));
            }
          }

          var evalExpr = field.get('eval').get(propKey);

          if (_.isString(evalExpr)) {
            var fn = funql.toFunction(evalExpr);
            var fnResult = fn();
            field.set(propKey, fnResult);
          } else if (evalExpr.get('lookup')) {
            var lookup = evalExpr.get('lookup');
            if (lookup.toArray) {
              lookup = lookup.toJS();
            }
            var dataKey = formatic.lookupKey(formState, rootFormState, path, lookup);

            var result = data[dataKey];

            if (result) {
              field.set('needLookupKey', null);
              field.set(propKey, formatic.fromJS(result));
            } else {
              field.set('needLookupKey', dataKey);
              field.set(propKey, field.get(fallbackPropKey));
            }
          }
        });
      }
      if (field.get('fields')) {
        field.set('fields', field.get('fields').map(function (field, i) {
          return formatic.updateData(field, data, rootFormState, path.concat(i));
        }).toVector());
      }
    });
  };

  formatic.form.eval = function (meta) {
    var result = formatic.eval(this, this._dynamicFormState, this._currentValue, meta);
    return result;
  };

  formatic.eval = function (form, fieldState, valueState, meta) {
    return formatic.evalField(form, fieldState, valueState, meta || {});
  };

  formatic.getInValueState = function (key, valueState) {
    if (!valueState) {
      return null;
    }
    var value = valueState.get('value');
    if (!value.get) {
      return null;
    }
    return value.get(key);
  };

  formatic.findTemplate = function (key, fieldState, parents) {
    var templates = fieldState.get('templates');
    var template;
    if (templates) {
      template = _.find(templates.toArray(), function (template) {
        return template.get('id') === key || template.get('key') === key;
      });
      if (template) {
        return template.remove('template');
      }
    }
    var fields = fieldState.get('fields');
    if (fields) {
      template = _.find(fields.toArray(), function (template) {
        return template.get('id') === key || template.get('key') === key;
      });
      if (template) {
        return template;
      }
    }
    if (parents.length > 0) {
      return formatic.findTemplate(key, parents[parents.length - 1], parents.slice(0, parents.length - 1));
    }
    return null;
  };

  formatic.resolveField = function (fieldState, parents) {
    var ext = fieldState.get('extends');
    if (!ext) {
      return fieldState;
    }
    ext = ext.toArray();
    var templates = ext.map(function (key) {
      return formatic.findTemplate(key, fieldState, parents);
    });
    fieldState = fieldState.remove('extends');
    var template = templates.reverse().reduce(function (prev, curr) {
      return prev.merge(curr);
    });
    return template.merge(fieldState);
  };

  formatic.buildEvalContext = function (fieldStates) {
    return fieldStates.reduce(function (prev, curr) {
      return formatic.evalContext(curr, null, prev);
    }, formatic.evalContext());
  };

  formatic.evalContext = function (fieldState, valueState, parentContext) {
    var context;
    if (!parentContext) {
      context = {
        parents: [],
        valuePath: [],
        vars: {}
      };
      if (valueState && valueState instanceof Immutable.Map) {
        _.extend(context.vars, formatic.unwrapValueState(valueState));
      }
      return context;
    }
    context = _.extend({}, parentContext);
    _.each(context, function (value, key) {
      if (_.isArray(value)) {
        context[key] = value.slice(0);
      } else if (_.isObject(value)) {
        context[key] = _.extend({}, value);
      }
    });

    if (fieldState.has('key')) {
      context.valuePath.push(fieldState.get('key'));
    }

    context.parents.push(fieldState);

    if (valueState && valueState instanceof Immutable.Map) {
      _.extend(context.vars, formatic.unwrapValueState(valueState));
    }

    return context;
  };

  formatic.unwrapValueState = function (valueState) {
    return formatic.unwrapValue(formatic.toJS(valueState));
  };

  formatic.evalField = function (form, fieldState, valueState, meta, context) {
    // expand field if necessary

    context = context || formatic.evalContext(fieldState, valueState, context);

    fieldState = formatic.resolveField(fieldState, context.parents);

    var type = fieldState.get('type');
    var typePlugin = formatic.type(type);

    var nextContext = formatic.evalContext(fieldState, valueState, context);

    fieldState = fieldState.set('_valuePath', formatic.fromJS(nextContext.valuePath));

    if (fieldState.has('key')) {
      valueState = formatic.getInValueState(fieldState.get('key'), valueState);
    }

    fieldState = formatic.runField(form, fieldState, valueState, meta, context, nextContext);

    fieldState = formatic.normalizeField(fieldState);
    if (typePlugin.normalizeField) {
      fieldState = typePlugin.normalizeField(fieldState);
    }

    if (fieldState.get('items')) {
      fieldState = fieldState.set('items', fieldState.get('items').map(function (itemState) {
        return formatic.resolveField(itemState, context.parents);
      }).toVector());
    }

    if (typePlugin.evalField) {
      var maybeFieldState = typePlugin.evalField(form, fieldState, valueState, meta, context, nextContext);
      if (maybeFieldState) {
        return maybeFieldState;
      }
    }

    if (fieldState.get('fields')) {
      return fieldState.set('fields', fieldState.get('fields').map(function (childState, i) {
        var child = formatic.evalField(form, childState, valueState, meta, nextContext);
        if (child.has('key')) {
          child = child.set('viewKey', child.get('key'));
        } else {
          child = child.set('viewKey', 'auto_' + i);
        }
        return child;
      }).toVector());
    } else {

      if (fieldState.has('key') && valueState) {
        return fieldState.set('value', formatic.unwrapValueState(valueState));
      } else {
        return fieldState;
      }
    }
  };

  formatic.itemMatchesValue = function (item, value) {
    var match = item.get('match');
    if (!match) {
      return true;
    }
    if (match.toJS) {
      var matchValue = match.toJS();
      return _.every(_.keys(matchValue), function (key) {
        return _.isEqual(matchValue[key], value[key]);
      });
    }
    return false;
  };

  formatic.itemForValueState = function (fieldState, valueState, context) {
    var value = formatic.unwrapValueState(valueState);
    var items = fieldState.get('items').toArray();
    var item;
    if (items) {
      item = _.find(items, function (item) {
        return formatic.itemMatchesValue(item, value);
      });
    }
    if (!item) {
      // TODO: create item from value
      throw new Error('Could not find matching item schema for value: ' + JSON.stringify(value));
    }
    return item;
  };

  formatic.normalizeField = function (fieldState) {
    return fieldState;
  };

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
          if (result) {
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
};

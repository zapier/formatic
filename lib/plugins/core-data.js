'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');
var Immutable = require('immutable');

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

  formatic.setValueOfField = function (formState, field, value) {
    var path = formatic.formStatePath(field);
    return formState.updateIn(path.concat('value'), function () {
      return Immutable.fromJS(value);
    });
  };

  formatic.appendField = function (formState, field, item, templateMap) {
    var path = formatic.formStatePath(field);
    var childDef = formatic.createFieldDef(item, templateMap);
    childDef.id = formatic.newId(field, childDef);
    return formState.updateIn(path.concat('fields'), function (fields) {
      return fields.push(Immutable.fromJS(childDef));
    });
  };

  formatic.removeField = function (formState, field, index) {
    return formState;
  };

  formatic.moveField = function (formState, field, fromIndex, toIndex) {
    return formState;
  };

  formatic.formToJS = function (form) {
    if (form._hasDirtyValue) {
      form._jsForm = form._formState.toJS();
    }
    return form._jsForm;
  };

  formatic.getFormValue = function (form) {
    var jsForm = formatic.formToJS(form);
    return formatic.getFieldValue(jsForm);
  };

  formatic.getFieldValue = function (field) {

    var typePlugin = formatic.type(field.type);

    if (typePlugin.getFieldValue) {
      return typePlugin.getFieldValue(field);
    }

    if (typeof field.value !== 'undefined') {
      return field.value;
    }
    if (typeof field.default === 'undefined') {
      return null;
    }
    return field.default;
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

    return formState.set('value', Immutable.fromJS(value));
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

          if (evalExpr.get('lookup')) {
            var lookup = evalExpr.get('lookup');
            if (lookup.toArray) {
              lookup = lookup.toJS();
            }
            var dataKey = formatic.lookupKey(formState, rootFormState, path, lookup);

            var result = data[dataKey];

            if (result) {
              field.set('needLookupKey', null);
              field.set(propKey, Immutable.fromJS(result));
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

  // var sources = {};
  //
  // formatic.form.wrap('init', function (next) {
  //   return next();
  // });
  //
  // formatic.source = function (key, fn) {
  //   if (typeof fn === 'undefined') {
  //     return sources[key];
  //   }
  //   sources[key] = fn;
  // };
  //
  // formatic.form.val = function (value) {
  //   if (typeof value === 'undefined') {
  //     return this.getValue();
  //   }
  //   return this.setValue(value);
  // };
  //
  // formatic.form.valAt = function (key, value) {
  //   if (typeof value === 'undefined') {
  //     return this.getValAt(key);
  //   } else {
  //     return this.setValAt(key, value);
  //   }
  // };
  //
  // formatic.form.getValAt = function (key) {
  //   var value;
  //   if (this.has('value')) {
  //     value = this.get('value');
  //   }
  //   if (this.has('default')) {
  //     value = this.get('default');
  //   }
  //   if (value && value.get) {
  //     return formatic.toJS(value.get(key));
  //   }
  //   return null;
  // };
  //
  // formatic.form.setValAt = function (key, subValue) {
  //   this._cursor.withMutations(function (field) {
  //     var value = field.get('value');
  //     if (!value) {
  //       value = field.get('default');
  //     }
  //     if (value) {
  //       field.set('value', value);
  //     }
  //     if (!value) {
  //       if (typeof key === 'number') {
  //         field.set('value', Immutable.fromJS([]));
  //       } else {
  //         field.set('value', Immutable.fromJS({}));
  //       }
  //     }
  //     value.set(key, subValue);
  //   });
  // };
  //
  // formatic.form.hasValAt = function (key) {
  //   var value;
  //   if (this.has('value')) {
  //     value = this.get('value');
  //   }
  //   if (this.has('default')) {
  //     value = this.get('default');
  //   }
  //   if (value && value.has) {
  //     return value.has(key);
  //   }
  //   return false;
  // };
  //
  // formatic.form.getValue = function () {
  //   if (this.typePlugin().getValue) {
  //     return formatic.toJS(this.typePlugin().getValue(this));
  //   }
  //   return formatic.toJS(this.getData());
  // };
  //
  // formatic.form.getData = function () {
  //   if (this.has('value')) {
  //     return this.get('value');
  //   }
  //   if (!this.has('default')) {
  //     return null;
  //   }
  //   return this.get('default');
  // };
  //
  // formatic.form.setValue = function (value) {
  //   if (_.isObject(value)) {
  //     if (value.deref && _.isFunction(value.deref)) {
  //       value = value.deref();
  //     }
  //     if (value.toJS && _.isFunction(value.toJS)) {
  //       value = value.toJS();
  //     }
  //   }
  //   if (this.typePlugin().setValue) {
  //     this.modify(function (form) {
  //       this.typePlugin().setValue(form, value);
  //     }.bind(this));
  //     return this;
  //   }
  //   return this.setData(value);
  // };
  //
  // formatic.form.modifyValue = function (fn) {
  //   var newData = this.get('value').withMutations(function (data) {
  //     fn(data);
  //   });
  //   this.set('value', newData);
  // };
  //
  // formatic.form.setData = function (data) {
  //   this.set('value', data);
  // };
  //
  // // formatic.buildMutableField = function (fieldDef, templateMap) {
  // //   if (!fieldDef.type) {
  // //     throw new Error('Field must specify type.');
  // //   }
  // //   var type = formatic.type(fieldDef.type);
  // //   var field = _.extend({
  // //     fields: [],
  // //     default: typeof type.default === 'undefined' ? null : type.default
  // //   }, fieldDef, formatic.getValidProps(fieldDef), type.getValidProps ? type.getValidProps(fieldDef) : {});
  // //   field.fields = field.fields.map(function (templateId) {
  // //     if (!templateMap[templateId]) {
  // //       throw new Error('Field ' + field.id + ' tried to reference unknown template: ' + templateId);
  // //     }
  // //     return formatic.buildMutableField(templateMap[templateId], templateMap);
  // //   });
  // //   return field;
  // // };
  //
  // formatic.modifyField = function (/*root, current*/) {
  //
  // };
  //
  // formatic.inflateField = function (root, parent, templateName) {
  //
  //   var templateMap = parent.child('_templates');
  //
  //   if (templateMap) {
  //     var map = templateMap.getData();
  //     if (map.has(templateName)) {
  //       return map.get(templateName).deref();
  //     }
  //   }
  //
  //   parent = parent.parent();
  //
  //   if (parent) {
  //     return formatic.inflateField(root, parent, templateName);
  //   }
  //
  //   throw new Error('Template ' + templateName + ' not found.');
  // };
  //
  // formatic.hasDep = function (root, current, dep) {
  //   var depField = root.find(dep, current);
  //   var depValue = depField.val();
  //   if (depValue) {
  //     if (_.isArray(depValue)) {
  //       return depValue.length > 0;
  //     }
  //     return true;
  //   }
  // };
  //
  // formatic.walkEval = function (root, current) {
  //   current = current || root;
  //
  //   var type = current.get('type');
  //
  //   if (!type) {
  //     throw new Error('Field must specify type.');
  //   }
  //
  //   var typePlugin = formatic.type(type);
  //
  //   if (!typePlugin) {
  //     throw new Error('Field must have a valid type.');
  //   }
  //
  //   var defaultValue = current.get('default');
  //
  //   if (typeof defaultValue === 'undefined') {
  //     defaultValue = typeof typePlugin.default === 'undefined' ? null : typePlugin.default;
  //     current.set('default', Immutable.fromJS(defaultValue));
  //   }
  //
  //   var fields = current.get('fields');
  //
  //   if (!fields) {
  //     current.set('fields', []);
  //     fields = current.get('fields');
  //   }
  //
  //   fields.forEach(function (field, i) {
  //     if (_.isString(field)) {
  //       var inflated = formatic.inflateField(root, current, field);
  //       inflated = inflated.set('id', formatic.newId(current, current.childFromCursor(inflated, field)));
  //       fields.set(i, inflated);
  //     }
  //   });
  //
  //   if (current.get('_value')) {
  //     var _value = formatic.toJS(current.get('_value'));
  //     current._cursor.remove('_value');
  //     current.val(_value);
  //   }
  //
  //   var dataDeps = current.deref('data');
  //
  //   if (dataDeps) {
  //     dataDeps.keySeq().forEach(function (propKey) {
  //       var dataKey = dataDeps.get(propKey);
  //       var dataField = current.find(dataKey, current);
  //       if (dataField) {
  //         var propValue = dataField.val();
  //         current.set(propKey, propValue);
  //       }
  //     });
  //   }
  //
  //   var showDeps = current.deref('when');
  //
  //   if (showDeps) {
  //     showDeps = showDeps.toArray();
  //     current.set('hidden', true);
  //     if (_.every(showDeps, function (dep) {
  //       return formatic.hasDep(root, current, dep);
  //     })) {
  //       current.set('hidden', false);
  //     }
  //   }
  //
  //   formatic.modifyField(root, current);
  //
  //   if (typePlugin.modifyField) {
  //     typePlugin.modifyField(root, current);
  //   }
  //
  //   if (fields && fields.length > 0) {
  //     current.each(function (child) {
  //       formatic.walkEval(root, child);
  //     });
  //   }
  //
  //   var items = current.get('items');
  //
  //   // Need to inflate first level so we have any match rules.
  //   if (items && items.count() > 0) {
  //     items.forEach(function (field, i) {
  //       if (_.isString(field)) {
  //         var inflated = formatic.inflateField(root, current, field);
  //         items.set(i, inflated);
  //       }
  //     });
  //   }
  // };
  //
  // formatic.eval = function (form) {
  //   return form.modify(function (form) {
  //     formatic.walkEval(form);
  //   });
  // };
  //
  // formatic.form.eval = function () {
  //   return formatic.eval(this);
  // };
};

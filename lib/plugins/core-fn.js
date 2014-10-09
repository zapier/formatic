'use strict';

var _ = require('underscore');
var Immutable = require('immutable');
//var Emitter = require('component-emitter');
var Reflux = require('reflux');
var utils = require('../utils');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next, formSource) {

    formatic.initForm(this, formSource);

    next();

    formatic.loadNeededMetadata(this);
  });

  var converter = function (key, sequence) {
    if (_.isArray(this[key])) {
      return sequence.toVector();
    } else {
      return sequence.toOrderedMap();
    }
  };

  formatic.fromJS = function (obj) {
    return Immutable.fromJS(obj, converter);
  };

  formatic.toJS = function (obj) {
    if (obj.toJS && _.isFunction(obj.toJS)) {
      return obj.toJS();
    }
    return obj;
  };

  formatic.onFormStoreChanged = function (form, result) {

    form._hasDirtyValue = true;

    form._currentValue = result.value;
    form._dynamicFormState = result.dynamicFormState;

    form._formState = form.eval(result.meta);

    form._fieldState = form._formState;

    formatic.loadNeededMetadata(form);

    formatic.render(form);
  };

  formatic.initForm = function (form, formSource) {

    form._needsKeys = [];
    form._fnCache = {};

    form._form = form;
    form._parents = [];

    form._hasDirtyValue = true;

    var compiledForm = formatic.compileFormSource(formSource);
    form._dynamicFormState = formatic.fromJS(compiledForm);

    form._formState = form.eval();
    var fatValue = formatic.wrapValue(formatic.valueOfFieldState(form._formState));
    form._currentValue = formatic.fromJS(fatValue);

    // console.log(formDef)
    //
    //
    // formDef = formatic.fillInFormDefIds(formDef);
    // formDef = formatic.createFormDefTree(formDef);
    // formDef = _.extend({}, formDef);
    // var templateMap = formDef._templates || {};
    // delete formDef._templates;
    // form._formState = formatic.createFormState(formDef, templateMap);

    //form._templateMap = templateMap;

    form._metaActions = Reflux.createActions(['setItem']);

    form._metaStore = formatic.plugin('stores.meta').create(form._metaActions);

    form._formActions = Reflux.createActions(['replaceForm', 'setFormValue', 'setValue', 'append', 'move', 'remove', 'undo']);

    form._formStore = formatic.plugin('stores.form').create(form._formActions, form._metaStore, form);

    form._formStore.listen(function (data) {
      formatic.onFormStoreChanged(form, data);
    });

    //form._metaActions.setItem('_templateMap', templateMap);
  };

  formatic.compileFormSource = function (formSource) {
    return formatic.compileFieldSource(formSource);
  };

  formatic.compileFieldSource = function (fieldSource) {
    if (!fieldSource) {
      return {
        type: 'empty'
      };
    }
    if (_.isArray(fieldSource)) {
      fieldSource = {
        type: 'object',
        fields: fieldSource
      };
    }
    if (_.isString(fieldSource)) {
      fieldSource = {
        extends: [fieldSource]
      };
    }
    fieldSource = _.extend({}, fieldSource);
    if (fieldSource.extends && !_.isArray(fieldSource.extends)) {
      fieldSource.extends = [fieldSource.extends];
    }
    if (fieldSource.fields && !_.isArray(fieldSource.fields)) {
      throw new Error('Fields must be an array.');
    }
    if (fieldSource.fields) {
      fieldSource.fields = fieldSource.fields.map(function (child) {
        return formatic.compileFieldSource(child);
      });
      fieldSource.templates = fieldSource.fields.filter(function (child) {
        return child.template;
      });
      fieldSource.fields = fieldSource.fields.filter(function (child) {
        return !child.template;
      });
    }
    if (fieldSource.items) {
      fieldSource.items = fieldSource.items.map(function (item) {
        if (_.isString(item)) {
          return {
            extends: [item]
          };
        }
        return item;
      });
    }
    return fieldSource;
  };

  formatic.valueFieldDef = function (value) {
    if (_.isArray(value)) {
      return {
        _nextViewKey: value.length,
        type: 'array',
        fields: value.map(function (child, i) {
          child = formatic.valueFieldDef(child);
          child._viewKey = i;
          return child;
        })
      };
    } else if (_.isObject(value)) {
      return {
        _nextViewKey: value.length,
        type: 'object',
        fields: _.keys(value).map(function (key, i) {
          var child = formatic.valueFieldDef(value[key]);
          child._viewKey = i;
          child.key = key;
          return child;
        })
      };
    } else if (_.isString(value)) {
      return {
        type: 'string',
        value: value
      };
    } else if (_.isNumber(value)) {
      return {
        type: 'number',
        value: value
      };
    } else if (_.isBoolean(value)) {
      return {
        type: 'boolean',
        value: value
      };
    } else if (value === null) {
      return {
        type: 'null',
        value: null
      };
    }
  };

  formatic.valueFieldState = function (value) {
    return formatic.fromJS(formatic.valueFieldDef(value));
  };

  // formatic.createFormState = function (formDef, templateMap) {
  //   var formState = formatic.fromJS(formDef);
  //   var compiled = formatic.createModifiedFieldFromFormState(formState);
  //   var inflated = formatic.inflateItems(compiled, templateMap);
  //   return formatic.fromJS(inflated);
  // };
  //
  // formatic.fillInFormDefIds = function (formDef) {
  //   var lastId = '';
  //   var typeIndexes = {};
  //   var map = {};
  //   var fieldDefs = formDef;
  //   var isArray = true;
  //   if (!_.isArray(fieldDefs)) {
  //     isArray = false;
  //     fieldDefs = [fieldDefs];
  //   }
  //   fieldDefs = fieldDefs.map(function (fieldDef) {
  //     return _.extend({}, fieldDef);
  //   });
  //   fieldDefs.forEach(function (fieldDef) {
  //
  //     if (!fieldDef.type) {
  //       throw new Error('Field definitions must have types: ' + JSON.stringify(fieldDef));
  //     }
  //
  //     if (!formatic.type(fieldDef.type)) {
  //       throw new Error('Unknown type for field definition: ' + fieldDef.type);
  //     }
  //
  //     var id = formatic.idOfFieldDef(fieldDef);
  //     if (id) {
  //       if (map[id]) {
  //         throw new Error('Field ids must be unique. id: ' + id);
  //       }
  //       lastId = id;
  //       typeIndexes = {};
  //     } else {
  //       // Making a best guess at an id that will stay the same.
  //       if (!(fieldDef.type in typeIndexes)) {
  //         typeIndexes[fieldDef.type] = -1;
  //       }
  //       typeIndexes[fieldDef.type]++;
  //       id = '__' + lastId + '__' + fieldDef.type + '__' + typeIndexes[fieldDef.type];
  //     }
  //     fieldDef.id = id;
  //     map[id] = fieldDef;
  //   });
  //
  //   if (!isArray) {
  //     fieldDefs = fieldDefs[0];
  //   }
  //
  //   return fieldDefs;
  // };
  //
  // formatic.idOfFieldDef = function (fieldDef) {
  //   return fieldDef.id || fieldDef.key || null;
  // };
  //
  // formatic.createFormDefTree = function (formDef) {
  //   formDef = formatic.createRootFormDef(formDef);
  //   formDef = formatic.inflateFormDefTemplates(formDef);
  //   return formDef;
  // };
  //
  // formatic.createRootFormDef = function (formDef) {
  //   if (_.isArray(formDef)) {
  //
  //     var fieldDefs = formDef;
  //
  //     var templates = fieldDefs.filter(function (fieldDef) {
  //       return fieldDef.template === true;
  //     });
  //
  //     var concretes = fieldDefs.filter(function (fieldDef) {
  //       return fieldDef.template !== true;
  //     });
  //
  //     var root = _.find(concretes, function (fieldDef) {
  //       return fieldDef.key === '.';
  //     });
  //
  //     if (root) {
  //       concretes = concretes.filter(function (fieldDef) {
  //         return fieldDef.key !== '.';
  //       });
  //     }
  //
  //     var templateMap = {};
  //
  //     concretes.forEach(function (template) {
  //       if (template.key) {
  //         templateMap[template.key] = template;
  //       }
  //       if (template.id) {
  //         templateMap[template.id] = template;
  //       }
  //     });
  //
  //     templates.forEach(function (template) {
  //       if (template.key) {
  //         templateMap[template.key] = template;
  //       }
  //       if (template.id) {
  //         templateMap[template.id] = template;
  //       }
  //     });
  //
  //     concretes.forEach(function (concrete, i) {
  //       if (_.isString(concrete)) {
  //         if (templateMap[concrete]) {
  //           concretes[i] = templateMap[concrete];
  //         } else {
  //           throw new Error('Template not found: ', concrete);
  //         }
  //       }
  //     });
  //
  //     if (root && concretes.length === 0) {
  //       return formatic.addTemplateData(root, templateMap);
  //     } else {
  //       var concreteKeys = concretes.map(function (concrete) {
  //         return concrete.id;
  //       });
  //       if (root) {
  //         return formatic.addTemplateData({
  //           id: '.',
  //           type: 'wrapper',
  //           fields: [root].concat(concreteKeys)
  //         }, templateMap);
  //       } else {
  //         return formatic.addTemplateData({
  //           id: '.',
  //           type: 'object',
  //           fields: concreteKeys
  //         }, templateMap);
  //       }
  //     }
  //
  //   } else if (_.isObject(formDef)) {
  //     return formDef;
  //   }
  // };
  //
  // formatic.addTemplateData = function (formDef, templateMap) {
  //   formDef = _.extend({}, formDef);
  //   formDef._templates = templateMap;
  //   return formDef;
  // };
  //
  // formatic.createFieldDef = function (fieldDef, templates) {
  //   fieldDef = JSON.parse(JSON.stringify(fieldDef));
  //   fieldDef = formatic.inflateFormDefTemplates(fieldDef, templates);
  //   formatic.modifyField(fieldDef);
  //   fieldDef = formatic.inflateItems(fieldDef, templates);
  //   return fieldDef;
  // };
  //
  // formatic.inflateFormDefTemplates = function (fieldDef, templateMap) {
  //   templateMap = templateMap || fieldDef._templates || {};
  //   fieldDef = _.extend({}, fieldDef);
  //   if (fieldDef.fields) {
  //     fieldDef.fields = fieldDef.fields.map(function (childDef) {
  //       return childDef;
  //     });
  //     fieldDef.fields.forEach(function (childDef, i) {
  //       if (_.isString(childDef)) {
  //         if (templateMap[childDef]) {
  //           var template = templateMap[childDef];
  //           childDef = _.extend({}, template);
  //         } else {
  //           throw new Error('Template not found: ' + childDef);
  //         }
  //       }
  //       fieldDef.fields[i] = formatic.inflateFormDefTemplates(childDef, templateMap);
  //     });
  //   }
  //   return fieldDef;
  // };
  //
  // formatic.createModifiedFieldFromFormState = function (formState) {
  //   var field = formState.toJS();
  //   formatic.modifyField(field);
  //   return field;
  // };
  //
  // formatic.modifyField = function (field, parent, i) {
  //   var typePlugin = formatic.type(field.type);
  //   if (typePlugin.modifyField) {
  //     typePlugin.modifyField(field, parent, i);
  //   }
  //   if (field.fields) {
  //     field.fields.forEach(function (child, i) {
  //       formatic.modifyField(child, field, i);
  //     });
  //   }
  // };
  //
  // formatic.inflateItems = function (field, templateMap) {
  //   if (field.fields || field.items) {
  //     field = _.extend({}, field);
  //     if (field.items) {
  //       field.items = field.items.map(function (item) {
  //         if (_.isString(item)) {
  //           if (!templateMap[item]) {
  //             throw new Error('No template found for item: ', item);
  //           }
  //           return templateMap[item];
  //         }
  //       });
  //     }
  //     if (field.fields) {
  //       field.fields = field.fields.map(function (child) {
  //         return formatic.inflateItems(child, templateMap);
  //       });
  //     }
  //   }
  //
  //   return field;
  // };
  //
  // formatic.childIdMap = function (field) {
  //   var idMap = {};
  //   if (field.get && _.isFunction(field.get)) {
  //     field.get('fields').forEach(function (child) {
  //       idMap[child.get('id')] = true;
  //     });
  //   } else {
  //     field.fields.forEach(function (child) {
  //       idMap[child.id] = true;
  //     });
  //   }
  //   return idMap;
  // };
  //
  // formatic.newId = function (field, child) {
  //   var idMap = formatic.childIdMap(field);
  //   if (child.id && !idMap[child.id]) {
  //     return child.id;
  //   }
  //   if (child.key && !idMap[child.key]) {
  //     return child.key;
  //   }
  //   var childId = child.id || child.key || '__auto';
  //   childId += '__';
  //   var i = 0;
  //   var newId = childId + i;
  //   while (idMap[newId]) {
  //     i++;
  //     newId = childId + i;
  //   }
  //   return newId;
  // };
  //
  // formatic.fieldDefFromValue = function (value, items, templateMap) {
  //   if (items && items.count() > 0) {
  //     var template = _.find(items.toArray(), function (template) {
  //       var imValue = formatic.fromJS(value);
  //       return formatic.matchValueToTemplate(imValue, template);
  //     });
  //     if (template) {
  //       return formatic.createFieldDef(template.toJS(), templateMap);
  //     }
  //   }
  //   var fieldDef = {
  //     type: 'json'
  //   };
  //   if (_.isString(value)) {
  //     fieldDef = {
  //       type: 'string'
  //     };
  //   } else if (_.isArray(value)) {
  //     var arrayItemFields = value.map(function (value, i) {
  //       var childDef = formatic.fieldDefFromValue(value);
  //       childDef.key = i;
  //       return childDef;
  //     });
  //     fieldDef = {
  //       type: 'array',
  //       fields: arrayItemFields
  //     };
  //   } else if (_.isObject(value)) {
  //     var objectItemFields = Object.keys(value).map(function (key) {
  //       var childDef = formatic.fieldDefFromValue(value[key]);
  //       childDef.key = key;
  //       childDef.label = formatic.humanize(key);
  //       return childDef;
  //     });
  //     fieldDef = {
  //       type: 'object',
  //       fields: objectItemFields
  //     };
  //   } else if (_.isNull(value)) {
  //     fieldDef = {
  //       type: 'null'
  //     };
  //   }
  //   return formatic.createFieldDef(fieldDef, {});
  // };
  //
  // formatic.humanize = function(property) {
  //   property = property.replace(/\{\{/g, '');
  //   property = property.replace(/\}\}/g, '');
  //   return property.replace(/_/g, ' ')
  //     .replace(/(\w+)/g, function(match) {
  //       return match.charAt(0).toUpperCase() + match.slice(1);
  //     });
  // };
  //
  // var equals = formatic.equals = function (a, b) {
  //   if (a && a.equals && a.equals(b)) {
  //     return true;
  //   } else if (b && b.equals && b.equals(a)) {
  //     return true;
  //   } else if (_.isEqual(a, b)) {
  //     return true;
  //   }
  // };
  //
  // formatic.matchValueToRule = function (value, rule) {
  //   if (rule.get('key')) {
  //     var key = rule.get('key');
  //     if (!(value.has(key))) {
  //       return false;
  //     }
  //     if (rule.has('value')) {
  //       if (!equals(value.get(key), rule.get('value'))) {
  //         return false;
  //       }
  //     }
  //     if (rule.has('notValue')) {
  //       if (equals(value.get(key), rule.get('notValue'))) {
  //         return false;
  //       }
  //     }
  //   }
  //   if (rule.get('notKey') && value.has(rule.get('notKey'))) {
  //     return false;
  //   }
  //   return true;
  // };
  //
  // formatic.matchValueToTemplate = function (value, template) {
  //   var match = template.get('match');
  //   if (!match) {
  //     return true;
  //   } else {
  //     return _.every(match.toArray(), function (rule) {
  //       return formatic.matchValueToRule(value, rule);
  //     });
  //   }
  // };
};

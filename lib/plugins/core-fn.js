'use strict';

var _ = require('underscore');
var Immutable = require('immutable');
//var Emitter = require('component-emitter');
var Reflux = require('reflux');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next, formDef) {

    formatic.initForm(this, formDef);

    return next();
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

  formatic.onFormStoreChanged = function (form, data) {

    form._formState = data;
    form._hasDirtyValue = true;

    formatic.loadNeededData(form);

    formatic.render(form);
  };

  formatic.initForm = function (form, formDef) {

    form._hasDirtyValue = true;

    formDef = formatic.fillInFormDefIds(formDef);
    formDef = formatic.createFormDefTree(formDef);
    formDef = _.extend({}, formDef);
    var templateMap = formDef._templates || {};
    delete formDef._templates;
    form._formState = formatic.createFormState(formDef, templateMap);

    //form._templateMap = templateMap;

    form._metaActions = Reflux.createActions(['setItem']);

    form._metaStore = formatic.plugin('stores.meta').create(form._metaActions);

    form._formActions = Reflux.createActions(['setFormValue', 'setValue', 'append', 'move', 'remove', 'undo']);

    form._formStore = formatic.plugin('stores.form').create(form._formActions, form._formState, form._metaStore);
    form._formStore.listen(function (data) {
      formatic.onFormStoreChanged(form, data);
    });

    form._metaActions.setItem('_templateMap', templateMap);
  };

  formatic.createFormState = function (formDef, templateMap) {
    var formState = formatic.fromJS(formDef);
    var compiled = formatic.createModifiedFieldFromFormState(formState);
    var inflated = formatic.inflateItems(compiled, templateMap);
    return formatic.fromJS(inflated);
  };

  formatic.fillInFormDefIds = function (formDef) {
    var lastId = '';
    var typeIndexes = {};
    var map = {};
    var fieldDefs = formDef;
    var isArray = true;
    if (!_.isArray(fieldDefs)) {
      isArray = false;
      fieldDefs = [fieldDefs];
    }
    fieldDefs = fieldDefs.map(function (fieldDef) {
      return _.extend({}, fieldDef);
    });
    fieldDefs.forEach(function (fieldDef) {

      if (!fieldDef.type) {
        throw new Error('Field definitions must have types: ' + JSON.stringify(fieldDef));
      }

      if (!formatic.type(fieldDef.type)) {
        throw new Error('Unknown type for field definition: ' + fieldDef.type);
      }

      var id = formatic.idOfFieldDef(fieldDef);
      if (id) {
        if (map[id]) {
          throw new Error('Field ids must be unique. id: ' + id);
        }
        lastId = id;
        typeIndexes = {};
      } else {
        // Making a best guess at an id that will stay the same.
        if (!(fieldDef.type in typeIndexes)) {
          typeIndexes[fieldDef.type] = -1;
        }
        typeIndexes[fieldDef.type]++;
        id = '__' + lastId + '__' + fieldDef.type + '__' + typeIndexes[fieldDef.type];
      }
      fieldDef.id = id;
      map[id] = fieldDef;
    });

    if (!isArray) {
      fieldDefs = fieldDefs[0];
    }

    return fieldDefs;
  };

  formatic.idOfFieldDef = function (fieldDef) {
    return fieldDef.id || fieldDef.key || null;
  };

  formatic.createFormDefTree = function (formDef) {
    formDef = formatic.createRootFormDef(formDef);
    formDef = formatic.inflateFormDefTemplates(formDef);
    return formDef;
  };

  formatic.createRootFormDef = function (formDef) {
    if (_.isArray(formDef)) {

      var fieldDefs = formDef;

      var templates = fieldDefs.filter(function (fieldDef) {
        return fieldDef.template === true;
      });

      var concretes = fieldDefs.filter(function (fieldDef) {
        return fieldDef.template !== true;
      });

      var root = _.find(concretes, function (fieldDef) {
        return fieldDef.key === '.';
      });

      if (root) {
        concretes = concretes.filter(function (fieldDef) {
          return fieldDef.key !== '.';
        });
      }

      var templateMap = {};

      concretes.forEach(function (template) {
        if (template.key) {
          templateMap[template.key] = template;
        }
        if (template.id) {
          templateMap[template.id] = template;
        }
      });

      templates.forEach(function (template) {
        if (template.key) {
          templateMap[template.key] = template;
        }
        if (template.id) {
          templateMap[template.id] = template;
        }
      });

      concretes.forEach(function (concrete, i) {
        if (_.isString(concrete)) {
          if (templateMap[concrete]) {
            concretes[i] = templateMap[concrete];
          } else {
            throw new Error('Template not found: ', concrete);
          }
        }
      });

      if (root && concretes.length === 0) {
        return formatic.addTemplateData(root, templateMap);
      } else {
        var concreteKeys = concretes.map(function (concrete) {
          return concrete.id;
        });
        if (root) {
          return formatic.addTemplateData({
            id: '.',
            type: 'wrapper',
            fields: [root].concat(concreteKeys)
          }, templateMap);
        } else {
          return formatic.addTemplateData({
            id: '.',
            type: 'object',
            fields: concreteKeys
          }, templateMap);
        }
      }

    } else if (_.isObject(formDef)) {
      return formDef;
    }
  };

  formatic.addTemplateData = function (formDef, templateMap) {
    formDef = _.extend({}, formDef);
    formDef._templates = templateMap;
    return formDef;
  };

  // formatic.findFormDefTemplate = function (templateName, parents) {
  //   if (parents.length > 0) {
  //     var parent = parents[parents.length - 1];
  //     var templateFieldDef = _.find(parent.fields, function (fieldDef) {
  //       return fieldDef.id === '_templates';
  //     });
  //     if (templateFieldDef) {
  //       if (templateFieldDef.value[templateName]) {
  //         return templateFieldDef.value[templateName];
  //       }
  //     }
  //   }
  //   return null;
  // };

  formatic.createFieldDef = function (fieldDef, templates) {
    fieldDef = JSON.parse(JSON.stringify(fieldDef));
    fieldDef = formatic.inflateFormDefTemplates(fieldDef, templates);
    formatic.modifyField(fieldDef);
    fieldDef = formatic.inflateItems(fieldDef, templates);
    return fieldDef;
  };

  formatic.inflateFormDefTemplates = function (fieldDef, templateMap) {
    templateMap = templateMap || fieldDef._templates || {};
    fieldDef = _.extend({}, fieldDef);
    if (fieldDef.fields) {
      fieldDef.fields = fieldDef.fields.map(function (childDef) {
        return childDef;
      });
      fieldDef.fields.forEach(function (childDef, i) {
        if (_.isString(childDef)) {
          if (templateMap[childDef]) {
            var template = templateMap[childDef];
            childDef = _.extend({}, template);
          } else {
            throw new Error('Template not found: ' + childDef);
          }
        }
        fieldDef.fields[i] = formatic.inflateFormDefTemplates(childDef, templateMap);
      });
    }
    return fieldDef;
  };

  formatic.createModifiedFieldFromFormState = function (formState) {
    var field = formState.toJS();
    formatic.modifyField(field);
    return field;
  };

  formatic.modifyField = function (field, parent, i) {
    var typePlugin = formatic.type(field.type);
    if (typePlugin.modifyField) {
      typePlugin.modifyField(field, parent, i);
    }
    if (field.fields) {
      field.fields.forEach(function (child, i) {
        formatic.modifyField(child, field, i);
      });
    }
  };

  formatic.inflateItems = function (field, templateMap) {
    if (field.fields || field.items) {
      field = _.extend({}, field);
      if (field.items) {
        field.items = field.items.map(function (item) {
          if (_.isString(item)) {
            if (!templateMap[item]) {
              throw new Error('No template found for item: ', item);
            }
            return templateMap[item];
          }
        });
      }
      if (field.fields) {
        field.fields = field.fields.map(function (child) {
          return formatic.inflateItems(child, templateMap);
        });
      }
    }

    return field;
  };

  formatic.childIdMap = function (field) {
    var idMap = {};
    if (field.get && _.isFunction(field.get)) {
      field.get('fields').forEach(function (child) {
        idMap[child.get('id')] = true;
      });
    } else {
      field.fields.forEach(function (child) {
        idMap[child.id] = true;
      });
    }
    return idMap;
  };

  formatic.newId = function (field, child) {
    var idMap = formatic.childIdMap(field);
    if (child.id && !idMap[child.id]) {
      return child.id;
    }
    if (child.key && !idMap[child.key]) {
      return child.key;
    }
    var childId = child.id || child.key || '__auto';
    childId += '__';
    var i = 0;
    var newId = childId + i;
    while (idMap[newId]) {
      i++;
      newId = childId + i;
    }
    return newId;
  };

  formatic.fieldDefFromValue = function (value, items, templateMap) {
    if (items && items.count() > 0) {
      var template = _.find(items.toArray(), function (template) {
        var imValue = formatic.fromJS(value);
        return formatic.matchValueToTemplate(imValue, template);
      });
      if (template) {
        return formatic.createFieldDef(template.toJS(), templateMap);
      }
    }
    var fieldDef = {
      type: 'json'
    };
    if (_.isString(value)) {
      fieldDef = {
        type: 'string'
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var childDef = formatic.fieldDefFromValue(value);
        childDef.key = i;
        return childDef;
      });
      fieldDef = {
        type: 'array',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var childDef = formatic.fieldDefFromValue(value[key]);
        childDef.key = key;
        childDef.label = formatic.humanize(key);
        return childDef;
      });
      fieldDef = {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      fieldDef = {
        type: 'null'
      };
    }
    return formatic.createFieldDef(fieldDef, {});
  };

  formatic.humanize = function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
      .replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
  };

  var equals = formatic.equals = function (a, b) {
    if (a && a.equals && a.equals(b)) {
      return true;
    } else if (b && b.equals && b.equals(a)) {
      return true;
    } else if (_.isEqual(a, b)) {
      return true;
    }
  };

  formatic.matchValueToRule = function (value, rule) {
    if (rule.get('key')) {
      var key = rule.get('key');
      if (!(value.has(key))) {
        return false;
      }
      if (rule.has('value')) {
        if (!equals(value.get(key), rule.get('value'))) {
          return false;
        }
      }
      if (rule.has('notValue')) {
        if (equals(value.get(key), rule.get('notValue'))) {
          return false;
        }
      }
    }
    if (rule.get('notKey') && value.has(rule.get('notKey'))) {
      return false;
    }
    return true;
  };

  formatic.matchValueToTemplate = function (value, template) {
    var match = template.get('match');
    if (!match) {
      return true;
    } else {
      return _.every(match.toArray(), function (rule) {
        return formatic.matchValueToRule(value, rule);
      });
    }
  };

  // formatic.compileFields = function (fields) {
  //   return fields.map(function (field) {
  //     return formatic.compileField(field);
  //   });
  // };

  // formatic.compileFormDef = function (formDef) {
  //   return formatic.compileField(formDef);
  // };
  //
  // formatic.compileField = function (field) {
  //   var typePlugin = formatic.type(field.type);
  //   if (typePlugin.compileField) {
  //     field = typePlugin.compileField(field);
  //   }
  //   if (field.fields) {
  //     field = _.extend({}, field);
  //     field.fields = formatic.compileFields(field.fields);
  //   }
  //   return field;
  // };
  //
  // formatic.compileFields = function (fields) {
  //   return fields.map(function (field) {
  //     return formatic.compileField(field);
  //   });
  // };

// (cursor, viewRules) -> (viewComponentDesc)
//
// (viewComponentDesc) -> (liveViewComponent)
//
// (formState, formChangeHandler) -> (cursor)
//
// (formDef) -> (formState)
//
// (formState) -> (ref)
//
// (viewComponentFactory) -> (viewComponentDesc)
//
//
// (data, formState) -> (formState)
//
//
// (id, params) -> (dataPromise)
//
//
// (formState) -> (data requirements)
//
// (formState, action) -> (formState)

  // formatic.form.wrap('init', function (next, fieldDefs) {
  //   if (!fieldDefs) {
  //     fieldDefs = [];
  //   }
  //   if (fieldDefs._cursor) {
  //     this._cursor = fieldDefs._cursor;
  //     this._parents = fieldDefs._parents;
  //     //this._path = fieldDefs._path;
  //     this._root = fieldDefs._root;
  //   } else {
  //     this._parents = [];
  //     //this._path = [];
  //     this._root = this;
  //     var inEval = false;
  //     // Parent form is just a reference to underlying data which is immutable.
  //     // Keep reference updated, rather than requiring external bookkeeping.
  //     var changeRef = function (field) {
  //       console.log('changing...')
  //       this._field = field;
  //       this._cursor = field.cursor(changeRef);
  //       if (!inEval) {
  //         inEval = true;
  //         this.eval();
  //       } else {
  //         inEval = false;
  //         this.render();
  //       }
  //       console.log('the end???')
  //     }.bind(this);
  //
  //     changeRef(formatic.buildFields(fieldDefs));
  //   }
  //   // this._parent = null;
  //   // this._children = [];
  //   // this._childMap = {};
  //   // this.fields(fieldDefs);
  //   // this._emitter = new Emitter();
  //   return next();
  // });
  //
  // formatic.idOfFieldDef = function (fieldDef) {
  //   return fieldDef.id || fieldDef.key || null;
  // };
  //
  // formatic.buildFieldIds = function (fieldDefs) {
  //   var lastId = '';
  //   var typeIndexes = {};
  //   var map = {};
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
  // };
  //
  // formatic.buildFields = function (fieldDefs) {
  //   if (_.isArray(fieldDefs)) {
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
  //     formatic.buildFieldIds(concretes);
  //
  //     if (root && concretes.length === 0) {
  //       return formatic.buildField(root, templateMap);
  //     } else {
  //       var concreteKeys = concretes.map(function (concrete) {
  //         return concrete.id;
  //       });
  //       if (root) {
  //         return formatic.buildField({
  //           id: '.',
  //           type: 'wrapper',
  //           fields: [root].concat(concreteKeys)
  //         }, templateMap);
  //       } else {
  //         return formatic.buildField({
  //           id: '.',
  //           type: 'object',
  //           fields: concreteKeys
  //         }, templateMap);
  //       }
  //     }
  //
  //   } else if (_.isObject(fieldDefs)) {
  //     var fieldDef = fieldDefs;
  //     return formatic.buildField(fieldDef);
  //   }
  // };
  //
  // formatic.buildField = function (fieldDef, templateMap) {
  //
  //   fieldDef = _.extend({}, fieldDef);
  //   if (templateMap) {
  //     fieldDef.fields = fieldDef.fields.concat({
  //       type: 'data',
  //       id: '_templates',
  //       value: templateMap
  //     });
  //   }
  //
  //   var field = Immutable.fromJS(fieldDef);
  //   return field;
  // };
  //
  // formatic.newId = function (field, child) {
  //   var idMap = {};
  //   field.each(function (child) {
  //     idMap[child.id()] = true;
  //   });
  //   if (child.id() && !idMap[child.id()]) {
  //     return child.id();
  //   }
  //   if (child.key() && !idMap[child.key()]) {
  //     return child.key();
  //   }
  //   var childId = child.id() || child.key() || '__auto';
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
  // formatic.form.append = function (fieldDef) {
  //   this.modify(function (field) {
  //     var fields = field.get('fields');
  //     var nextIndex = fields.count();
  //     fields.set(nextIndex, Immutable.fromJS(fieldDef));
  //     var child = this.childFromCursor(fields.get(nextIndex), field);
  //     child.set('id', formatic.newId(field, child));
  //     //formatic.walkEval(field._root, child);
  //   }.bind(this));
  // };
  //
  // formatic.form.remove = function (keyOrIndex) {
  //   if (_.isNumber(keyOrIndex)) {
  //     var index = keyOrIndex;
  //     var fields = this.deref('fields');
  //     if (fields.length > index) {
  //       fields = fields.splice(index, 1).toVector();
  //       this.set('fields', fields);
  //     }
  //   }
  // };
  //
  // formatic.form.move = function (fromKeyOrIndex, toKeyOrIndex) {
  //   if (_.isNumber(fromKeyOrIndex) && _.isNumber(toKeyOrIndex)) {
  //     var fromIndex = fromKeyOrIndex;
  //     var toIndex = toKeyOrIndex;
  //
  //     var fields = this.deref('fields');
  //
  //     if (fromIndex !== toIndex &&
  //       fromIndex >= 0 && fromIndex < fields.length &&
  //       toIndex >= 0 && toIndex < fields.length
  //     ) {
  //       var removedField = fields.get(fromIndex);
  //       fields = fields.splice(fromIndex, 1).toVector();
  //       fields = fields.splice(toIndex, 0, removedField).toVector();
  //       this.set('fields', fields);
  //     }
  //   }
  // };
  //
  // formatic.fieldDefFromValue = function (value) {
  //   if (_.isString(value)) {
  //     return {
  //       type: 'string',
  //       default: value
  //     };
  //   } else if (_.isArray(value)) {
  //     var arrayItemFields = value.map(function (value, i) {
  //       var fieldDef = formatic.fieldDefFromValue(value);
  //       fieldDef.key = i;
  //       return fieldDef;
  //     });
  //     return {
  //       type: 'array',
  //       fields: arrayItemFields
  //     };
  //   } else if (_.isObject(value)) {
  //     var objectItemFields = Object.keys(value).map(function (key) {
  //       var fieldDef = formatic.fieldDefFromValue(value[key]);
  //       fieldDef.key = key;
  //       fieldDef.label = formatic.humanize(key);
  //       return fieldDef;
  //     });
  //     return {
  //       type: 'object',
  //       fields: objectItemFields
  //     };
  //   } else if (_.isNull(value)) {
  //     return {
  //       type: 'null'
  //     };
  //   }
  // };
  //

  //
  // formatic.form.fieldDefFromValue = function (value) {
  //   var items = this.get('items');
  //   if (items && items.count() > 0) {
  //     var template = _.find(items.toArray(), function (template) {
  //       var imValue = Immutable.fromJS(value);
  //       return formatic.matchValueToTemplate(imValue, template);
  //     });
  //     if (template) {
  //       return template.deref().toJS();
  //     }
  //   }
  //   return formatic.fieldDefFromValue(value);
  // };
  //
  // formatic.addFormProperty = function (name) {
  //   formatic.form[name] = function (value) {
  //     if (typeof value === 'undefined') {
  //       return this.get(name);
  //     }
  //     return this.set(name, value);
  //   };
  // };
  //
  // formatic.addFormProperty('type');
  // formatic.addFormProperty('key');
  // formatic.addFormProperty('id');
  // formatic.addFormProperty('hidden');
  // formatic.addFormProperty('choices');
  // formatic.addFormProperty('default');
  // formatic.addFormProperty('label');
  // formatic.addFormProperty('helpText');
  //
  // formatic.form.typePlugin = function () {
  //   return formatic.type(this.type());
  // };
  //
  // formatic.form.childFromCursor = function (cursor, newParent) {
  //   if (!newParent) {
  //     newParent = this;
  //   }
  //   return formatic({
  //     _cursor: cursor,
  //     _parents: this._parents.slice(0, this._parents.length - 1).concat(newParent),
  //     //_path: this._path.concat(index),
  //     _root: this._root
  //   });
  // };
  //
  // formatic.form.cloneFromCursor = function (cursor) {
  //   return formatic({
  //     _cursor: cursor,
  //     //_path: this._path,
  //     _parents: this._parents,
  //     _root: this._root
  //   });
  // };
  //
  // formatic.form.children = function () {
  //   if (!this.has('fields')) {
  //     return Immutable.Vector();
  //   }
  //   return this.get('fields').filter(function (field) {
  //     return field.cursor;
  //   }).map(function (fieldCursor) {
  //     return this.childFromCursor(fieldCursor);
  //   }.bind(this));
  // };
  //
  // formatic.form.child = function (key) {
  //   var children = this.children().toArray();
  //   var matchingField = _.find(children, function (child) {
  //     return child.id() === key || child.key() === key;
  //   });
  //   return matchingField;
  // };
  //
  // formatic.form.each = function () {
  //   var children = this.children();
  //   return children.forEach.apply(children, arguments);
  // };
  //
  // formatic.form.hasKey = function () {
  //   return this.get('key') ? true : false;
  // };
  //
  // formatic.form.modify = function (fn) {
  //   var newCursor = this._cursor.withMutations(function (field) {
  //     var cursor = field.cursor();
  //     fn(this.cloneFromCursor(cursor));
  //   }.bind(this));
  //   return this.cloneFromCursor(newCursor);
  // };
  //
  // formatic.form.parent = function () {
  //   if (this._parents.length === 0) {
  //     return null;
  //   }
  //   return this._parents[this._parents.length - 1];
  // };
  //
  // formatic.form.index = function () {
  //   if (this._path.length > 0) {
  //     return this._path[this._path.length - 1];
  //   }
  //   return 0;
  // };
  //
  // formatic.form.has = function (key) {
  //   return this._cursor.has(key);
  // };
  //
  // formatic.form.get = function (key) {
  //   return this._cursor.get(key);
  // };
  //
  // formatic.toJS = function (value) {
  //   if (value && value.cursor) {
  //     return value.deref().toJS();
  //   }
  //   return value;
  // };
  //
  // formatic.form.getJS = function (key) {
  //   return formatic.toJS(this._cursor.get(key));
  // };
  //
  // formatic.form.set = function (key, value) {
  //   if (value && value.cursor) {
  //     return this._cursor.set(key, value);
  //   } else {
  //     return this._cursor.set(key, Immutable.fromJS(value));
  //   }
  // };
  //
  // formatic.form.deref = function (key) {
  //   if (key) {
  //     return this._cursor.deref().get(key);
  //   }
  //   return this._cursor.deref();
  // };
  //
  // formatic.form.find = function (key, upFrom) {
  //   /*eslint no-loop-func:0*/
  //
  //   // start by looking at self
  //   var fields = [this];
  //
  //   while (fields.length > 0) {
  //     var matchingField = _.find(fields, function (field) {
  //       return field.id() === key || field.key() === key;
  //     });
  //     if (matchingField) {
  //       return matchingField;
  //     }
  //     // keep going into children (breadth first)
  //     fields = _.flatten(fields.map(function (field) {
  //       return field.children().toArray();
  //     }));
  //
  //     // just an efficiency thing; don't dig back into same child
  //     if (upFrom) {
  //       fields = fields.filter(function (field) {
  //         return !(field._cursor.equals(upFrom._cursor));
  //       });
  //       upFrom = null;
  //     }
  //   }
  //
  //   var parent = this.parent();
  //
  //   if (parent) {
  //     return parent.find(key, this);
  //   }
  //
  //   return null;
  // };
  //
  // formatic.form.findChild = function (fn) {
  //   return _.find(this.children(), fn);
  // };
  //
};

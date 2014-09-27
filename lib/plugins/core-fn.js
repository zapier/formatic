'use strict';

var _ = require('underscore');
var Immutable = require('immutable');
//var Emitter = require('component-emitter');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next, fieldDefs) {
    if (!fieldDefs) {
      fieldDefs = [];
    }
    if (fieldDefs._cursor) {
      this._cursor = fieldDefs._cursor;
      this._parents = fieldDefs._parents;
      //this._path = fieldDefs._path;
      this._root = fieldDefs._root;
    } else {
      this._parents = [];
      //this._path = [];
      this._root = this;
      var inEval = false;
      // Parent form is just a reference to underlying data which is immutable.
      // Keep reference updated, rather than requiring external bookkeeping.
      var changeRef = function (field) {
        console.log('changing...')
        this._field = field;
        this._cursor = field.cursor(changeRef);
        if (!inEval) {
          inEval = true;
          this.eval();
        } else {
          inEval = false;
          this.render();
        }
        console.log('the end???')
      }.bind(this);

      changeRef(formatic.buildFields(fieldDefs));
    }
    // this._parent = null;
    // this._children = [];
    // this._childMap = {};
    // this.fields(fieldDefs);
    // this._emitter = new Emitter();
    return next();
  });

  formatic.idOfFieldDef = function (fieldDef) {
    return fieldDef.id || fieldDef.key || null;
  };

  formatic.buildFieldIds = function (fieldDefs) {
    var lastId = '';
    var typeIndexes = {};
    var map = {};
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
  };

  formatic.buildFields = function (fieldDefs) {
    if (_.isArray(fieldDefs)) {

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

      formatic.buildFieldIds(concretes);

      if (root && concretes.length === 0) {
        return formatic.buildField(root, templateMap);
      } else {
        var concreteKeys = concretes.map(function (concrete) {
          return concrete.id;
        });
        if (root) {
          return formatic.buildField({
            id: '.',
            type: 'wrapper',
            fields: [root].concat(concreteKeys)
          }, templateMap);
        } else {
          return formatic.buildField({
            id: '.',
            type: 'object',
            fields: concreteKeys
          }, templateMap);
        }
      }

    } else if (_.isObject(fieldDefs)) {
      var fieldDef = fieldDefs;
      return formatic.buildField(fieldDef);
    }
  };

  formatic.buildField = function (fieldDef, templateMap) {

    fieldDef = _.extend({}, fieldDef);
    if (templateMap) {
      fieldDef.fields = fieldDef.fields.concat({
        type: 'data',
        id: '_templates',
        value: templateMap
      });
    }

    var field = Immutable.fromJS(fieldDef);
    return field;
  };

  formatic.newId = function (field, child) {
    var idMap = {};
    field.each(function (child) {
      idMap[child.id()] = true;
    });
    if (child.id() && !idMap[child.id()]) {
      return child.id();
    }
    if (child.key() && !idMap[child.key()]) {
      return child.key();
    }
    var childId = child.id() || child.key() || '__auto';
    childId += '__';
    var i = 0;
    var newId = childId + i;
    while (idMap[newId]) {
      i++;
      newId = childId + i;
    }
    return newId;
  };

  formatic.form.append = function (fieldDef) {
    this.modify(function (field) {
      var fields = field.get('fields');
      var nextIndex = fields.count();
      fields.set(nextIndex, Immutable.fromJS(fieldDef));
      var child = this.childFromCursor(fields.get(nextIndex), field);
      child.set('id', formatic.newId(field, child));
      //formatic.walkEval(field._root, child);
    }.bind(this));
  };

  formatic.form.remove = function (keyOrIndex) {
    if (_.isNumber(keyOrIndex)) {
      var index = keyOrIndex;
      var fields = this.deref('fields');
      if (fields.length > index) {
        fields = fields.splice(index, 1).toVector();
        this.set('fields', fields);
      }
    }
  };

  formatic.form.move = function (fromKeyOrIndex, toKeyOrIndex) {
    if (_.isNumber(fromKeyOrIndex) && _.isNumber(toKeyOrIndex)) {
      var fromIndex = fromKeyOrIndex;
      var toIndex = toKeyOrIndex;

      var fields = this.deref('fields');

      if (fromIndex !== toIndex &&
        fromIndex >= 0 && fromIndex < fields.length &&
        toIndex >= 0 && toIndex < fields.length
      ) {
        var removedField = fields.get(fromIndex);
        fields = fields.splice(fromIndex, 1).toVector();
        fields = fields.splice(toIndex, 0, removedField).toVector();
        this.set('fields', fields);
      }
    }
  };

  formatic.fieldDefFromValue = function (value) {
    if (_.isString(value)) {
      return {
        type: 'string',
        default: value
      };
    } else if (_.isArray(value)) {
      var arrayItemFields = value.map(function (value, i) {
        var fieldDef = formatic.fieldDefFromValue(value);
        fieldDef.key = i;
        return fieldDef;
      });
      return {
        type: 'array',
        fields: arrayItemFields
      };
    } else if (_.isObject(value)) {
      var objectItemFields = Object.keys(value).map(function (key) {
        var fieldDef = formatic.fieldDefFromValue(value[key]);
        fieldDef.key = key;
        fieldDef.label = formatic.humanize(key);
        return fieldDef;
      });
      return {
        type: 'object',
        fields: objectItemFields
      };
    } else if (_.isNull(value)) {
      return {
        type: 'null'
      };
    }
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
        return formatic.matchValueToRule(value, rule.deref());
      });
    }
  };

  formatic.form.fieldDefFromValue = function (value) {
    var items = this.get('items');
    if (items && items.count() > 0) {
      var template = _.find(items.toArray(), function (template) {
        var imValue = Immutable.fromJS(value);
        return formatic.matchValueToTemplate(imValue, template);
      });
      if (template) {
        return template.deref().toJS();
      }
    }
    return formatic.fieldDefFromValue(value);
  };

  formatic.addFormProperty = function (name) {
    formatic.form[name] = function (value) {
      if (typeof value === 'undefined') {
        return this.get(name);
      }
      return this.set(name, value);
    };
  };

  formatic.addFormProperty('type');
  formatic.addFormProperty('key');
  formatic.addFormProperty('id');
  formatic.addFormProperty('hidden');
  formatic.addFormProperty('choices');
  formatic.addFormProperty('default');
  formatic.addFormProperty('label');
  formatic.addFormProperty('helpText');

  formatic.form.typePlugin = function () {
    return formatic.type(this.type());
  };

  formatic.form.childFromCursor = function (cursor, newParent) {
    if (!newParent) {
      newParent = this;
    }
    return formatic({
      _cursor: cursor,
      _parents: this._parents.slice(0, this._parents.length - 1).concat(newParent),
      //_path: this._path.concat(index),
      _root: this._root
    });
  };

  formatic.form.cloneFromCursor = function (cursor) {
    return formatic({
      _cursor: cursor,
      //_path: this._path,
      _parents: this._parents,
      _root: this._root
    });
  };

  formatic.form.children = function () {
    if (!this.has('fields')) {
      return Immutable.Vector();
    }
    return this.get('fields').filter(function (field) {
      return field.cursor;
    }).map(function (fieldCursor) {
      return this.childFromCursor(fieldCursor);
    }.bind(this));
  };

  formatic.form.child = function (key) {
    var children = this.children().toArray();
    var matchingField = _.find(children, function (child) {
      return child.id() === key || child.key() === key;
    });
    return matchingField;
  };

  formatic.form.each = function () {
    var children = this.children();
    return children.forEach.apply(children, arguments);
  };

  formatic.form.hasKey = function () {
    return this.get('key') ? true : false;
  };

  formatic.form.modify = function (fn) {
    var newCursor = this._cursor.withMutations(function (field) {
      var cursor = field.cursor();
      fn(this.cloneFromCursor(cursor));
    }.bind(this));
    return this.cloneFromCursor(newCursor);
  };

  formatic.form.parent = function () {
    if (this._parents.length === 0) {
      return null;
    }
    return this._parents[this._parents.length - 1];
  };

  formatic.form.index = function () {
    if (this._path.length > 0) {
      return this._path[this._path.length - 1];
    }
    return 0;
  };

  formatic.form.has = function (key) {
    return this._cursor.has(key);
  };

  formatic.form.get = function (key) {
    return this._cursor.get(key);
  };

  formatic.toJS = function (value) {
    if (value && value.cursor) {
      return value.deref().toJS();
    }
    return value;
  };

  formatic.form.getJS = function (key) {
    return formatic.toJS(this._cursor.get(key));
  };

  formatic.form.set = function (key, value) {
    if (value && value.cursor) {
      return this._cursor.set(key, value);
    } else {
      return this._cursor.set(key, Immutable.fromJS(value));
    }
  };

  formatic.form.deref = function (key) {
    if (key) {
      return this._cursor.deref().get(key);
    }
    return this._cursor.deref();
  };

  formatic.form.find = function (key, upFrom) {
    /*eslint no-loop-func:0*/

    // start by looking at self
    var fields = [this];

    while (fields.length > 0) {
      var matchingField = _.find(fields, function (field) {
        return field.id() === key || field.key() === key;
      });
      if (matchingField) {
        return matchingField;
      }
      // keep going into children (breadth first)
      fields = _.flatten(fields.map(function (field) {
        return field.children().toArray();
      }));

      // just an efficiency thing; don't dig back into same child
      if (upFrom) {
        fields = fields.filter(function (field) {
          return !(field._cursor.equals(upFrom._cursor));
        });
        upFrom = null;
      }
    }

    var parent = this.parent();

    if (parent) {
      return parent.find(key, this);
    }

    return null;
  };

  formatic.form.findChild = function (fn) {
    return _.find(this.children(), fn);
  };

  formatic.humanize = function(property) {
    property = property.replace(/\{\{/g, '');
    property = property.replace(/\}\}/g, '');
    return property.replace(/_/g, ' ')
      .replace(/(\w+)/g, function(match) {
        return match.charAt(0).toUpperCase() + match.slice(1);
      });
  };
};

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
      this._path = fieldDefs._path;
    } else {
      this._path = [];
      var inEval = false;
      // Parent form is just a reference to underlying data which is immutable.
      // Keep reference updated, rather than requiring external bookkeeping.
      var changeRef = function (field) {
        this._field = field;
        this._cursor = field.cursor(changeRef);
        if (!inEval) {
          inEval = true;
          this.eval();
        } else {
          inEval = false;
          this.render();
        }
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

  // formatic.buildFieldIds = function (fieldDefs) {
  //   var list = [];
  //   var map = {};
  //   var lastId = '';
  //   var typeIndexes = {};
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
  //     fieldDef = _.extend({}, fieldDef);
  //     fieldDef.id = id;
  //     map[id] = fieldDef;
  //     list.push(fieldDef);
  //   });
  //   return {
  //     map: map,
  //     list: list
  //   };
  // };
  //
  // formatic.buildRootMap = function (list, map) {
  //   var rootMap = {};
  //   list.forEach(function (fieldDef) {
  //     if (!(fieldDef.id in rootMap)) {
  //       rootMap[fieldDef.id] = true;
  //     }
  //     if (fieldDef.fields) {
  //       fieldDef.fields.forEach(function (id) {
  //         rootMap[id] = false;
  //       });
  //     }
  //   });
  //   // Root has to be root.
  //   if (map['.']) {
  //     rootMap['.'] = true;
  //   }
  //   return rootMap;
  // };
  //
  // formatic.buildFields = function (fieldDefs) {
  //   if (_.isArray(fieldDefs)) {
  //     var result = formatic.buildFieldIds(fieldDefs);
  //     var map = result.map;
  //     var list = result.list;
  //
  //     var rootMap = formatic.buildRootMap(list, map);
  //
  //     var rootKeys = list.filter(function (fieldDef) {
  //       return rootMap[fieldDef.id];
  //     }).map(function (fieldDef) {
  //       return fieldDef.id;
  //     });
  //
  //     if (map['.'] && rootKeys.length === 1) {
  //       return formatic.buildField(map['.'], map);
  //     } else if (map['.']) {
  //       return formatic.buildField({
  //         id: '.',
  //         type: 'wrapper',
  //         fields: rootKeys
  //       }, map);
  //     } else {
  //       return formatic.buildField({
  //         id: '.',
  //         type: 'object',
  //         fields: rootKeys
  //       }, map);
  //     }
  //
  //   } else if (_.isObject(fieldDefs)) {
  //     var fieldDef = fieldDefs;
  //     return formatic.buildField(fieldDef);
  //   }
  // };

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

      //     if (map['.'] && rootKeys.length === 1) {
      //       return formatic.buildField(map['.'], map);
      //     } else if (map['.']) {
      //       return formatic.buildField({
      //         id: '.',
      //         type: 'wrapper',
      //         fields: rootKeys
      //       }, map);
      //     } else {
      //       return formatic.buildField({
      //         id: '.',
      //         type: 'object',
      //         fields: rootKeys
      //       }, map);
      //     }

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
    //
    //
    // return Immutable.fromJS(formatic.buildMutableField(fieldDef, templateMap));
  };

  formatic.form.append = function (fieldDef) {
    var fields = this._cursor.get('fields');
    var nextIndex = fields.count();

    fields.set(nextIndex, Immutable.fromJS(fieldDef));
  };

  formatic.fieldDefFromValue = function (value) {
    if (_.isString(value)) {
      return {
        type: 'string',
        default: value
      };
    } else if (_.isArray(value)) {
      return {
        type: 'array'
      };
    } else if (_.isObject(value)) {
      var fields = Object.keys(value).map(function (key) {
        var fieldDef = formatic.fieldDefFromValue(value[key]);
        fieldDef.key = key;
        fieldDef.label = formatic.humanize(key);
        return fieldDef;
      });
      return {
        type: 'object',
        fields: fields
      };
    } else if (_.isNull(value)) {
      return {
        type: 'null'
      };
    }
  };

  // formatic.buildMutableField = function (fieldDef, templateMap) {
  //   if (!fieldDef.type) {
  //     throw new Error('Field must specify type.');
  //   }
  //   var type = formatic.type(fieldDef.type);
  //   var field = _.extend({
  //     fields: [],
  //     default: typeof type.default === 'undefined' ? null : type.default
  //   }, fieldDef, formatic.getValidProps(fieldDef), type.getValidProps ? type.getValidProps(fieldDef) : {});
  //   field.fields = field.fields.map(function (templateId) {
  //     if (!templateMap[templateId]) {
  //       throw new Error('Field ' + field.id + ' tried to reference unknown template: ' + templateId);
  //     }
  //     return formatic.buildMutableField(templateMap[templateId], templateMap);
  //   });
  //   return field;
  // };

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

  formatic.form.childFromCursor = function (cursor, index) {
    return formatic({
      _cursor: cursor,
      _path: this._path.concat(index)
    });
  };

  formatic.form.cloneFromCursor = function (cursor) {
    return formatic({
      _cursor: cursor,
      _path: this._path
    });
  };

  formatic.form.children = function () {
    if (!this.has('fields')) {
      return Immutable.Vector();
    }
    return this.get('fields').filter(function (field) {
      return field.cursor;
    }).map(function (fieldCursor, i) {
      return this.childFromCursor(fieldCursor, i);
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

  formatic.form.parentFromPath = function (path) {
    if (path.length === 0) {
      return null;
    }
    path = path.slice(0, path.length - 1);
    var realPath = _.flatten(path.map(function (index) {
      return ['fields', index];
    }));
    var parentCursor = this._cursor.getIn(realPath);
    return formatic({
      _cursor: parentCursor,
      _path: path
    });
  };

  formatic.form.index = function () {
    if (this._path.length > 0) {
      return this._path[this._path.length - 1];
    }
    return 0;
  };

  // formatic.form.hasProp = function (key) {
  //   return typeof this.get(key) !== 'undefined';
  // };
  //
  // formatic.form.prop = function (name, value) {
  //   if (typeof value === 'undefined') {
  //     return this.getProp(name);
  //   }
  //   return this.setProp(name, value);
  // };
  //
  // formatic.form.getProp = function (key) {
  //   if (this._cursor.has(key)) {
  //     var value = this._cursor.get(key);
  //     if (_.isObject(value)) {
  //       if (value.deref) {
  //         return value.deref().toJS();
  //       } else {
  //         return value.toJS();
  //       }
  //     } else if (typeof value === 'undefined') {
  //       return null;
  //     } else {
  //       return value;
  //     }
  //   } else {
  //     return null;
  //   }
  // };
  //
  // formatic.form.setProp = function (key, value) {
  //   return this.cloneFromCursor(this._cursor.set(key, Immutable.fromJS(value)));
  // };

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

  // formatic.form.props = function () {
  //   // var props = {};
  //   // var cursor = this._cursor;
  //   // cursor.keys().filter(function (key) {
  //   //   return key !== 'fields';
  //   // }).forEach(function (key) {
  //   //   props[key] = cursor.get(key).toJS();
  //   // });
  //   // return props;
  //   //if (cursor.deref())
  // };

  formatic.form.find = function (key, fromField, upFromIndex) {
    /*eslint no-loop-func:0*/

    fromField = fromField || this;

    // start by looking at self
    var fields = [fromField];

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
      if (upFromIndex !== null && typeof upFromIndex !== 'undefined') {
        fields = fields.filter(function (field, i) {
          return upFromIndex !== i;
        });
        upFromIndex = null;
      }
    }

    if (fromField._path.length > 0) {
      return this.find(key, this.parentFromPath(fromField._path), fromField.index());
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

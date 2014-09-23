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
      var inCalc = false;
      // Parent form is just a reference to underlying data which is immutable.
      // Keep reference updated, rather than requiring external bookkeeping.
      var changeRef = function (field) {
        this._field = field;
        this._cursor = field.cursor(changeRef);
        if (!inCalc) {
          inCalc = true;
          this.calculate();
        } else {
          inCalc = false;
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

  formatic.buildFieldIds = function (fieldDefs) {
    var list = [];
    var map = {};
    var lastId = '';
    var typeIndexes = {};
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
      fieldDef = _.extend({}, fieldDef);
      fieldDef.id = id;
      map[id] = fieldDef;
      list.push(fieldDef);
    });
    return {
      map: map,
      list: list
    };
  };

  formatic.buildRootMap = function (list, map) {
    var rootMap = {};
    list.forEach(function (fieldDef) {
      if (!(fieldDef.id in rootMap)) {
        rootMap[fieldDef.id] = true;
      }
      if (fieldDef.fields) {
        fieldDef.fields.forEach(function (id) {
          rootMap[id] = false;
        });
      }
    });
    // Root has to be root.
    if (map['.']) {
      rootMap['.'] = true;
    }
    return rootMap;
  };

  formatic.buildFields = function (fieldDefs) {
    if (_.isArray(fieldDefs)) {
      var result = formatic.buildFieldIds(fieldDefs);
      var map = result.map;
      var list = result.list;

      var rootMap = formatic.buildRootMap(list, map);

      var rootKeys = list.filter(function (fieldDef) {
        return rootMap[fieldDef.id];
      }).map(function (fieldDef) {
        return fieldDef.id;
      });

      if (map['.'] && rootKeys.length === 1) {
        return formatic.buildField(map['.'], map);
      } else if (map['.']) {
        return formatic.buildField({
          id: '.',
          type: 'wrapper',
          fields: rootKeys
        }, map);
      } else {
        return formatic.buildField({
          id: '.',
          type: 'object',
          fields: rootKeys
        }, map);
      }

    } else if (_.isObject(fieldDefs)) {
      var fieldDef = fieldDefs;
      return formatic.buildField(fieldDef);
    }
  };

  formatic.buildField = function (fieldDef, templateMap) {
    return Immutable.fromJS(formatic.buildMutableField(fieldDef, templateMap));
  };

  formatic.buildMutableField = function (fieldDef, templateMap) {
    if (!fieldDef.type) {
      throw new Error('Field must specify type.');
    }
    var type = formatic.type(fieldDef.type);
    var field = _.extend({
      fields: [],
      _data: null,
      default: typeof type.default === 'undefined' ? null : type.default
    }, fieldDef, type.getValidProps ? type.getValidProps(fieldDef) : {});
    field.fields = field.fields.map(function (templateId) {
      if (!templateMap[templateId]) {
        throw new Error('Field ' + field.id + ' tried to reference unknown template: ' + templateId);
      }
      return formatic.buildMutableField(templateMap[templateId], templateMap);
    });
    return field;
  };

  formatic.addFormProperty = function (name) {
    formatic.form[name] = function () {
      return this._cursor.get(name);
    };
  };

  formatic.addFormProperty('type');
  formatic.addFormProperty('key');
  formatic.addFormProperty('id');
  formatic.addFormProperty('hidden');

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
    return this._cursor.cursor('fields').toArray().map(function (fieldCursor, i) {
      var child = this.childFromCursor(fieldCursor, i);
      return child;
    }.bind(this));
  };

  formatic.form.each = function () {
    var children = this.children();
    return children.forEach.apply(children, arguments);
  };

  formatic.form.hasKey = function () {
    return this._cursor.get('key') ? true : false;
  };

  formatic.form.modify = function (fn) {
    var newCursor = this._cursor.withMutations(function (cursor) {
      fn(this.cloneFromCursor(cursor));
    }.bind(this));
    return this.cloneFromCursor(newCursor);
  };

  formatic.form.parentFromPath = function (path) {
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

  formatic.form.hasProp = function (key) {
    return this._cursor.has(key);
  };

  formatic.form.getProp = function (key) {
    if (this._cursor.has(key)) {
      return this._cursor.get(key).toJS();
    } else {
      return null;
    }
  };

  formatic.form.setProp = function (key, value) {
    this._cursor.set(key, Immutable.fromJS(value));
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
        return field.children();
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

  // formatic.form.do = function (ops) {
  //   console.log(ops)
  //   return this._cursor.withMutations(function (cursor) {
  //     ops.forEach(function (op) {
  //       cursor.cursor(op.path).update(function () {
  //         return op.value;
  //       });
  //     });
  //   });
  // };

  //
  // formatic.form.fields = function (fieldDefs) {
  //
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
  //       this.field(map['.'], map);
  //     } else if (map['.']) {
  //       this.field({
  //         id: '.',
  //         type: 'wrapper',
  //         fields: rootKeys
  //       }, map);
  //     } else {
  //       this.field({
  //         id: '.',
  //         type: 'object',
  //         fields: rootKeys
  //       }, map);
  //     }
  //
  //   } else if (_.isObject(fieldDefs)) {
  //     var fieldDef = fieldDefs;
  //     this.field(fieldDef);
  //   }
  // };
  //
  // formatic.form.append = function (fieldDef) {
  //   var field = formatic(fieldDef);
  //   this._children.push(field);
  //   field.parent(this);
  //   return this;
  // };
  //
  // formatic.form.findTemplate = function (id) {
  //   if (this._templateMap) {
  //     if (this._templateMap[id]) {
  //       return this._templateMap[id];
  //     }
  //   }
  //   if (this._parent) {
  //     return this._parent.findTemplate(id);
  //   }
  //   return null;
  // };
  //
  // formatic.form.field = function (fieldDef, map) {
  //   this._type = formatic.type(fieldDef.type);
  //   this._props = _.extend({}, fieldDef);
  //   if (this._type.props) {
  //     this._props = this._type.props(this._props);
  //   }
  //   this._data = null;
  //   this._default = null;
  //   this._children = [];
  //   this._templateMap = map || null;
  //   if (typeof this._type.default !== 'undefined') {
  //     this._default = this._type.default;
  //   }
  //   this._key = fieldDef.key || null;
  //   if (!fieldDef.id) {
  //     throw new Error('Every field must have a unique id.');
  //   }
  //   this._id = fieldDef.id;
  //   if (this._templateMap) {
  //     this.inflateFields();
  //     this.walk(function (field) {
  //       if (field.props().data) {
  //         _.each(field.props().data, function (dataKey, propKey) {
  //           var dataField = this.find(dataKey);
  //           dataField.on('change', function () {
  //             field.prop(propKey, dataField.val());
  //             if (field._type.props) {
  //               field._props = field._type.props(field._props);
  //             }
  //           });
  //         }.bind(this));
  //       }
  //     }.bind(this));
  //   }
  // };
  //
  // formatic.form.parent = function (parent) {
  //   if (typeof parent !== 'undefined') {
  //     return this.setParent(parent);
  //   }
  //   return this.getParent();
  // };
  //
  // formatic.form.setParent = function (parent) {
  //   this._parent = parent;
  //   parent._childMap[this._id] = this;
  //   if (this._key) {
  //     parent._childMap[this._key] = this;
  //   }
  //   this.inflateFields();
  // };
  //
  // formatic.form.getParent = function () {
  //   return this._parent;
  // };
  //
  // formatic.form.inflateFields = function () {
  //   if (this.props().fields) {
  //     this.props().fields.forEach(function (templateId) {
  //       var template = this.findTemplate(templateId);
  //       if (!template) {
  //         throw new Error('Field ' + this.id() + ' tried to reference unknown template: ' + templateId);
  //       }
  //       this.append(template);
  //     }.bind(this));
  //   }
  // };
  //
  // formatic.form.props = function () {
  //   return this._props;
  // };
  //
  // formatic.form.prop = function (key, value) {
  //   if (typeof value === 'undefined') {
  //     return this.getProp(key);
  //   }
  //   return this.setProp(key, value);
  // };
  //
  // formatic.form.setProp = function (key, value) {
  //   this._props[key] = value;
  // };
  //
  // formatic.form.getProp = function (key) {
  //   return this._props[key] || null;
  // };
  //
  // formatic.form.children = function () {
  //   return this._children;
  // };
  //
  // formatic.form.each = function () {
  //   return this._children.forEach.apply(this._children, arguments);
  // };
  //
  // formatic.form.key = function () {
  //   return this._key;
  // };
  //
  // formatic.form.hasKey = function () {
  //   return this._key ? true : false;
  // };
  //
  // formatic.form.id = function () {
  //   return this._id;
  // };
  //
  // formatic.form.debug = function (indent) {
  //   indent = indent || '';
  //   var text = indent + this.id() + ' (' + this.props().type + ')\n';
  //   text += indent + '= ' + this._data + '\n';
  //   this.children().forEach(function (child) {
  //     text += child.debug(indent + '  ');
  //   });
  //   return text;
  // };
  //
  // formatic.form.isMatch = function (key) {
  //   return (this.id() === key || this.key() === key);
  // };
  //
  // formatic.form.find = function (key, upFromField) {
  //   /*eslint no-loop-func:0*/
  //
  //   // start by looking at self
  //   var fields = [this];
  //
  //   while (fields.length > 0) {
  //     var matchingField = _.find(fields, function (field) {
  //       return field.isMatch(key);
  //     });
  //     if (matchingField) {
  //       return matchingField;
  //     }
  //     // keep going into children (breadth first)
  //     fields = _.flatten(fields.map(function (field) {
  //       return field.children();
  //     }));
  //     // just an efficiency thing; don't dig back into same child
  //     if (upFromField) {
  //       fields = fields.filter(function (field) {
  //         return field !== upFromField;
  //       });
  //       upFromField = null;
  //     }
  //   }
  //
  //   // now look at parents, avoiding self since we already looked there
  //   if (this.parent()) {
  //     return this.parent().find(key, this);
  //   }
  //
  //   return null;
  // };
  //
  // formatic.form.on = function () {
  //   this._emitter.on.apply(this._emitter, arguments);
  // };
  //
  // formatic.form.walk = function (fn) {
  //   fn(this);
  //   this.each(function (child) {
  //     child.walk(fn);
  //   });
  // };
};

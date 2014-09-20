'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next, fieldDefs) {
    this._parent = null;
    this._children = [];
    this._childMap = {};
    this.fields(fieldDefs);
    this._emitter = new Emitter();
    return next();
  });

  var idOfFieldDef = function (fieldDef) {
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

      var id = idOfFieldDef(fieldDef);
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

  formatic.form.fields = function (fieldDefs) {

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
        this.field(map['.'], map);
      } else if (map['.']) {
        this.field({
          id: '.',
          type: 'wrapper',
          fields: rootKeys
        }, map);
      } else {
        this.field({
          id: '.',
          type: 'object',
          fields: rootKeys
        }, map);
      }

    } else if (_.isObject(fieldDefs)) {
      var fieldDef = fieldDefs;
      this.field(fieldDef);
    }
  };

  formatic.form.append = function (fieldDef) {
    var field = formatic(fieldDef);
    this._children.push(field);
    field.parent(this);
    return this;
  };

  formatic.form.findTemplate = function (id) {
    if (this._templateMap) {
      if (this._templateMap[id]) {
        return this._templateMap[id];
      }
    }
    if (this._parent) {
      return this._parent.findTemplate(id);
    }
    return null;
  };

  formatic.form.field = function (fieldDef, map) {
    this._type = formatic.type(fieldDef.type);
    this._props = _.extend({}, fieldDef);
    if (this._type.props) {
      this._props = this._type.props(this._props);
    }
    this._data = null;
    this._default = null;
    this._children = [];
    this._templateMap = map || null;
    if (typeof this._type.default !== 'undefined') {
      this._default = this._type.default;
    }
    this._key = fieldDef.key || null;
    if (!fieldDef.id) {
      throw new Error('Every field must have a unique id.');
    }
    this._id = fieldDef.id;
    if (this._templateMap) {
      this.inflateFields();
      this.walk(function (field) {
        if (field.props().data) {
          _.each(field.props().data, function (dataKey, propKey) {
            var dataField = this.find(dataKey);
            dataField.on('change', function () {
              field.prop(propKey, dataField.val());
              if (field._type.props) {
                field._props = field._type.props(field._props);
              }
            });
          }.bind(this));
        }
      }.bind(this));
    }
  };

  formatic.form.parent = function (parent) {
    if (typeof parent !== 'undefined') {
      return this.setParent(parent);
    }
    return this.getParent();
  };

  formatic.form.setParent = function (parent) {
    this._parent = parent;
    parent._childMap[this._id] = this;
    if (this._key) {
      parent._childMap[this._key] = this;
    }
    this.inflateFields();
  };

  formatic.form.getParent = function () {
    return this._parent;
  };

  formatic.form.inflateFields = function () {
    if (this.props().fields) {
      this.props().fields.forEach(function (templateId) {
        var template = this.findTemplate(templateId);
        if (!template) {
          throw new Error('Field ' + this.id() + ' tried to reference unknown template: ' + templateId);
        }
        this.append(template);
      }.bind(this));
    }
  };

  formatic.form.props = function () {
    return this._props;
  };

  formatic.form.prop = function (key, value) {
    if (typeof value === 'undefined') {
      return this.getProp(key);
    }
    return this.setProp(key, value);
  };

  formatic.form.setProp = function (key, value) {
    this._props[key] = value;
  };

  formatic.form.getProp = function (key) {
    return this._props[key] || null;
  };

  formatic.form.children = function () {
    return this._children;
  };

  formatic.form.each = function () {
    return this._children.forEach.apply(this._children, arguments);
  };

  formatic.form.key = function () {
    return this._key;
  };

  formatic.form.hasKey = function () {
    return this._key ? true : false;
  };

  formatic.form.id = function () {
    return this._id;
  };

  formatic.form.debug = function (indent) {
    indent = indent || '';
    var text = indent + this.id() + ' (' + this.props().type + ')\n';
    text += indent + '= ' + this._data + '\n';
    this.children().forEach(function (child) {
      text += child.debug(indent + '  ');
    });
    return text;
  };

  formatic.form.isMatch = function (key) {
    return (this.id() === key || this.key() === key);
  };

  formatic.form.find = function (key, upFromField) {
    /*eslint no-loop-func:0*/

    // start by looking at self
    var fields = [this];

    while (fields.length > 0) {
      var matchingField = _.find(fields, function (field) {
        return field.isMatch(key);
      });
      if (matchingField) {
        return matchingField;
      }
      // keep going into children (breadth first)
      fields = _.flatten(fields.map(function (field) {
        return field.children();
      }));
      // just an efficiency thing; don't dig back into same child
      if (upFromField) {
        fields = fields.filter(function (field) {
          return field !== upFromField;
        });
        upFromField = null;
      }
    }

    // now look at parents, avoiding self since we already looked there
    if (this.parent()) {
      return this.parent().find(key, this);
    }

    return null;
  };

  formatic.form.on = function () {
    this._emitter.on.apply(this._emitter, arguments);
  };

  formatic.form.walk = function (fn) {
    fn(this);
    this.each(function (child) {
      child.walk(fn);
    });
  };
};

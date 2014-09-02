'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');

module.exports = function (formatic) {

  var Actions = function (form) {
    this.form = form;
  };

  formatic.action = function (name) {
    Actions.prototype[name] = function () {
      var args = [name].concat(Array.prototype.slice.call(arguments));
      this.form.emitter.emit.apply(this.form.emitter, args);
    };
  };

  formatic.form.wrap('init', function (next) {
    this.data = {};
    this.root = this.defaultRoot();
    this.emitter = new Emitter();
    this.actions = new Actions(this);
    this.emitter.on('change', function (field, value) {
      this.onChange(field, value);
    }.bind(this));
    this.emitter.on('delete', function (field, key) {
      this.onDelete(field, key);
    }.bind(this));
    this.emitter.on('insert', function (field, index, item) {
      this.onInsert(field, index, item);
    }.bind(this));
    this.emitter.on('move', function (field, fromIndex, toIndex) {
      this.onMove(field, fromIndex, toIndex);
    }.bind(this));
    next();
  });

  formatic.action('change');
  formatic.action('focus');
  formatic.action('blur');
  formatic.action('delete');
  formatic.action('insert');
  formatic.action('move');

  formatic.form.defaultRoot = function () {
    return {
      type: 'formatic',
      fields: []
    };
  };

  formatic.form.fields = function (fields) {
    this.root = this.compile(fields);
    this.update();
  };

  formatic.form.set = function (key, value) {

    if (typeof value === 'undefined') {
      this.setData(key);
    } else {
      this.setKey(key, value);
    }

    this.update();
  };

  formatic.form.val = function () {

    var field = this.run(this.root, this.data);

    return formatic.fieldValue(field);
  };

  formatic.form.onChange = function (field, value) {
    if (field && field._keyPath) {
      try {
        var type = formatic.type(field.type);
        if (type && type.parseField) {
          value = type.parseField(value);
        }
        this.set(field._keyPath, value);
      } catch (e) {
        // failed to parse; don't respond to this change and leave state in
        // view till it is parseable
      }
    }
  };

  formatic.form.onDelete = function (field, key) {
    if (field && field._keyPath) {
      var parent = formatic.getObject(this.data, field._keyPath);

      if (_.isArray(parent)) {
        if (typeof key === 'number') {
          parent.splice(key, 1);
          this.update();
        }
      } else if (_.isObject(parent)) {
        delete parent[key];
        this.update();
      }
    }
  };

  var tempPrefix = '__missing_key__';

  formatic.form.tempKey = function (field) {
    if (field._keyPath) {
      var parent = formatic.getObject(this.data, field._keyPath);

      if (_.isObject(parent) && !_.isArray(parent)) {
        var id = 0;
        var key = tempPrefix + id;
        while (key in parent) {
          id++;
          key = tempPrefix + id;
        }
        return key;
      }
    }
    return null;
  };

  formatic.form.isTempKey = function (key) {
    return key.substring(0, tempPrefix.length) === tempPrefix;
  };

  formatic.form.onInsert = function (field, index, item) {
    if (field._keyPath) {

      item = item || field.item || {
        type: 'text',
        value: '',
        key: '[]'
      };

      item = this.compileField(item);

      // Need to evaluate the field to get a default value out.
      item = this.runField(item, {});

      var value = formatic.fieldValue(item);

      value = value[''];

      var parent = formatic.getObject(this.data, field._keyPath);

      if (_.isArray(parent)) {
        if (typeof index !== 'number' || index > parent.length) {
          index = parent.length;
        }

        parent.splice(index, 0, value);
      } else {
        parent[index] = value;
      }

      this.update();
    }
  };

  formatic.form.onMove = function (field, fromIndex, toIndex) {
    if (field._keyPath) {

      var parent = formatic.getObject(this.data, field._keyPath);

      if (_.isArray(parent)) {
        if (fromIndex !== toIndex &&
          fromIndex >= 0 && fromIndex < parent.length &&
          toIndex >= 0 && toIndex < parent.length
        ) {
          parent.splice(toIndex, 0, parent.splice(fromIndex, 1)[0]);
          this.update();
        }
      } else if (_.isObject(parent)) {
        if (fromIndex !== toIndex) {
          parent[toIndex] = parent[fromIndex];
          delete parent[fromIndex];
          this.update();
        }
      }
    }
  };

  formatic.form.on = function () {
    return this.emitter.on.apply(this.emitter, arguments);
  };

  formatic.form.off = function () {
    return this.emitter.off.apply(this.emitter, arguments);
  };

  formatic.form.compileField = function (field) {
    return field;
  };

  formatic.form.compile = function (field) {
    return this.compileField(field);
  };

  formatic.form.setData = function (value) {
    this.data = value;
  };

  formatic.form.setKey = function (key, value) {
    formatic.setObject(this.data, key, value);
  };

  formatic.form.update = function () {

    var field = this.run(this.root, this.data);

    var props = {form: this, field: field};

    this.emitter.emit('update', props);

    this.updateView(props);
  };

  formatic.fieldValue = function (field) {

    var obj = null;
    var ops = formatic.fieldValues(field);

    ops.forEach(function (op) {

      if (typeof op.value !== 'undefined' && formatic.isRootKey(op.path)) {
        obj = op.value;
      } else {
        if (obj === null) {
          obj = {};
        }
        formatic.setObject(obj, op.path, op.value);
      }
    });

    return obj;
  };

  formatic.fieldValues = function (field, path, values) {
    path = path || '';
    values = values || [];
    if (field.key && typeof field.value !== 'undefined') {
      values.push({
        path: formatic.joinKey(path, field.key),
        value: field.value
      });
    } else {
      if (field.key) {
        path = formatic.joinKey(path, field.key);
      }
      if (field.isArray) {
        values.push({
          value: [],
          path: path
        });
      }
      if (field.fields) {
        field.fields.forEach(function (childField) {
          formatic.fieldValues(childField, path, values);
        });
      }
    }
    return values;
  };

  formatic.splitKey = function (key) {
    return objectpath.parse(key);
    //return key.split('.');
  };

  formatic.getObject = function (obj, key) {

    if (!_.isObject(obj)) {
      return undefined;
    }

    if (!key) {
      return obj;
    }

    var parts = key;

    if (!_.isArray(key)) {
      parts = formatic.splitKey(key);
    }

    var value = obj[parts[0]];

    if (parts.length > 1) {

      return formatic.getObject(value, parts.slice(1));
    }

    return value;
  };

  formatic.setObject = function (obj, key, value) {

    var parts = formatic.splitKey(key);

    _.each(parts, function (part, i) {
      if (i === (parts.length - 1)) {
        return;
      }
      if (!(part in obj)) {
        obj[part] = {};
      }
      obj = obj[part];
    });

    key = parts[parts.length - 1];

    obj[key] = value;
  };

  formatic.isRootKey = function (key) {
    if (key === '' || key === '.') {
      return true;
    }
  };

  formatic.joinKey = function (fromKey, toKey) {
    if (formatic.isRootKey(fromKey)) {
      return toKey;
    } else if (toKey[0] === '[') {
      return fromKey + toKey;
    } else {
      return fromKey + '.' + toKey;
    }
  };

  formatic.form.bindField = function (field, data, parentKey, index) {

    // console.log('-----')
    // console.log(field.key);
    // console.log(JSON.stringify(field));
    // console.log(JSON.stringify(data));

    //console.log('FIELD:', JSON.stringify(field))

    field = _.extend({}, field);

    if (field.key) {

      var key = field.key;

      if (key === '[]' && typeof index !== 'undefined') {
        key = '[' + JSON.stringify(index) + ']';
      }

      if (parentKey) {
        key = formatic.joinKey(parentKey, key);
      }

      field._keyPath = key;

      //console.log(field.key);

      var value = formatic.getObject(data, field._keyPath);
      // console.log(value);
      if (typeof field.value !== 'undefined' && typeof value !== 'undefined') {
        field.value = value;
      }
    }

    // console.log(JSON.stringify(field));

    return field;
  };

  formatic.form.evalField = function (field, data, parentKey, index) {

    var children = field.fields;

    if (children) {
      field.fields = [];

      _.each(children, function (child, i) {
        field.fields.push(this.runField(child, data, field.key || parentKey, field.key ? i : index));
      }.bind(this));
    }

    return field;
  };

  formatic.form.runField = function (field, data, parentKey, index) {

    if (typeof field !== 'object') {
      return null;
    }

    field = this.bindField(field, data, parentKey, index);

    field = this.evalField(field, data, parentKey, index);

    return field;
  };

  formatic.form.cleanField = function (field) {

    if (field && field.fields) {
      field.fields = field.fields.filter(function (field) {
        return field;
      }).map(function (field) {
        return this.cleanField(field);
      }.bind(this));

      return field;
    }

    return field;

  };

  formatic.form.run = function (field, data) {

    field = this.runField(field, data);

    field = this.cleanField(field);

    return field;
  };
};

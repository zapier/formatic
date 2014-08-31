'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');

module.exports = function (formatic) {

  var Actions = function (form) {
    this.form = form;
  };

  formatic.method('action', function (name) {
    Actions.prototype[name] = function () {
      var args = [name].concat(Array.prototype.slice.call(arguments));
      this.form.emitter.emit.apply(this.form.emitter, args);
    };
  });

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

  formatic.form.method('defaultRoot', function () {
    return {
      type: 'form',
      fields: []
    };
  });

  formatic.form.method('fields', function (fields) {
    this.root = this.compile(fields);
    this.update();
  });

  formatic.form.method('set', function (key, value) {

    if (typeof value === 'undefined') {
      this.setData(key);
    } else {
      this.setKey(key, value);
    }

    this.update();
  });

  formatic.form.method('val', function () {

    var field = this.run(this.root, this.data);
    var obj = {};

    this.fieldToObject(field, obj);

    return obj;
  });

  formatic.form.method('onChange', function (field, value) {
    if (field && field.key) {
      try {
        var type = formatic.type(field.type);
        if (type && type.hasMethod('parseField')) {
          value = type.parseField(value);
        }
        this.set(field.key, value);
      } catch (e) {
        // failed to parse; don't respond to this change and leave state in
        // view till it is parseable
      }
    }
  });

  formatic.form.method('onDelete', function (field, key) {
    if (field && field.key) {
      var parent = formatic.getObject(this.data, field.key);

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
  });

  var tempPrefix = '__missing_key__';

  formatic.form.method('tempKey', function (field) {
    if (field.key) {
      var parent = formatic.getObject(this.data, field.key);

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
  });

  formatic.form.method('isTempKey', function (key) {
    return key.substring(0, tempPrefix.length) === tempPrefix;
  });

  formatic.form.method('onInsert', function (field, index, item) {
    if (field.key) {

      item = item || field.item || {
        type: 'text',
        value: '',
        key: '[]'
      };

      item = this.compileField(item);

      // Need to evaluate the field to get a default value out.
      item = this.runField(item, {});

      var obj = {};

      this.fieldToObject(item, obj);

      var value = '';

      if (obj['']) {
        value = obj[''];
      }

      var parent = formatic.getObject(this.data, field.key);

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
  });

  formatic.form.method('onMove', function (field, fromIndex, toIndex) {
    if (field.key) {

      var parent = formatic.getObject(this.data, field.key);

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
  });

  formatic.form.method('on', function () {
    return this.emitter.on.apply(this.emitter, arguments);
  });

  formatic.form.method('off', function () {
    return this.emitter.off.apply(this.emitter, arguments);
  });

  formatic.form.method('compileField', function (field) {
    return field;
  });

  formatic.form.method('compile', function (field) {
    return this.compileField(field);
  });

  formatic.form.method('setData', function (value) {
    this.data = value;
  });

  formatic.form.method('setKey', function (key, value) {
    formatic.setObject(this.data, key, value);
  });

  formatic.form.method('update', function () {

    var field = this.run(this.root, this.data);

    var props = {form: this, field: field};

    this.emitter.emit('update', props);

    this.updateView(props);
  });

  formatic.form.method('fieldToObject', function (field, obj) {

    if (field.key) {
      if (typeof field.value !== 'undefined') {
        formatic.setObject(obj, field.key, field.value);
      } else {
        if (formatic.type(field.type).isArray) {
          formatic.setObject(obj, field.key, []);
        } else if (formatic.type(field.type).isObject) {
          formatic.setObject(obj, field.key, {});
        }
      }
    }

    if (field.fields) {
      _.each(field.fields, function (field) {
        this.fieldToObject(field, obj);
      }.bind(this));
    }
  });

  formatic.method('splitKey', function (key) {
    return objectpath.parse(key);
    //return key.split('.');
  });

  formatic.method('getObject', function (obj, key) {

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
  });

  formatic.method('setObject', function (obj, key, value) {

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
  });

  var joinKey = function (fromKey, toKey) {
    if (toKey[0] === '[') {
      return fromKey + toKey;
    } else {
      return fromKey + '.' + toKey;
    }
  };

  formatic.form.method('bindField', function (field, data, parentKey, index) {

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
        key = joinKey(parentKey, key);
      }

      field.key = key;

      //console.log(field.key);

      var value = formatic.getObject(data, field.key);
      // console.log(value);
      if (typeof field.value !== 'undefined' && typeof value !== 'undefined') {
        field.value = value;
      }
    }

    // console.log(JSON.stringify(field));

    return field;
  });

  formatic.form.method('evalField', function (field, data, parentKey, index) {

    var children = field.fields;

    if (children) {
      field.fields = [];

      _.each(children, function (child, i) {
        field.fields.push(this.runField(child, data, field.key || parentKey, field.key ? i : index));
      }.bind(this));
    }

    return field;
  });

  formatic.form.method('runField', function (field, data, parentKey, index) {

    if (typeof field !== 'object') {
      return null;
    }

    field = this.bindField(field, data, parentKey, index);

    field = this.evalField(field, data, parentKey, index);

    return field;
  });

  formatic.form.method('cleanField', function (field) {

    if (field && field.fields) {
      field.fields = field.fields.filter(function (field) {
        return field;
      }).map(function (field) {
        return this.cleanField(field);
      }.bind(this));

      return field;
    }

    return field;

  });

  formatic.form.method('run', function (field, data) {

    field = this.runField(field, data);

    field = this.cleanField(field);

    return field;
  });
};

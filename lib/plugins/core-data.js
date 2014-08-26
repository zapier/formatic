'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');

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
    next();
  });

  formatic.action('change');
  formatic.action('focus');
  formatic.action('blur');

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

  formatic.form.method('on', function () {
    return this.emitter.on.apply(this.emitter, arguments);
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
      formatic.setObject(obj, field.key, field.value);
    }

    if (field.fields) {
      _.each(field.fields, function (field) {
        this.fieldToObject(field, obj);
      }.bind(this));
    }
  });

  formatic.method('splitKey', function (key) {
    return key.split('.');
  });

  formatic.method('getObject', function (obj, key) {

    if (!_.isObject(obj)) {
      return undefined;
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

  formatic.form.method('bindField', function (field, data) {

    field = _.extend({}, field);

    if (field.key) {
      var value = formatic.getObject(data, field.key);
      if (typeof value !== 'undefined') {
        field.value = value;
      }
    }

    return field;
  });

  formatic.form.method('evalField', function (field, data) {

    var children = field.fields;

    if (children) {
      field.fields = [];

      _.each(children, function (child) {
        field.fields.push(this.runField(child, data));
      }.bind(this));
    }

    return field;
  });

  formatic.form.method('runField', function (field, data) {

    if (typeof field !== 'object') {
      return null;
    }

    field = this.bindField(field, data);

    field = this.evalField(field, data);

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

'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');

var utils = require('../utils');

module.exports = function (formatic) {

  formatic.form.use('init', function (next) {
    this.data = {};
    this.root = this.defaultRoot();
    this.emitter = new Emitter();
    next();
  });

  formatic.form.hook('defaultRoot', function () {
    return {
      type: 'form',
      fields: []
    };
  });

  formatic.form.hook('fields', function (fields) {
    this.root = this.compile(fields);
    this.update();
  });

  formatic.form.hook('set', function (key, value) {

    if (typeof value === 'undefined') {
      this.data(key);
    } else {
      this.setKey(key, value);
    }

    this.update();
  });

  formatic.form.hook('val', function () {

    var field = this.run(this.root, this.data);
    var obj = {};

    this.fieldToObject(field, obj);

    return obj;
  });

  formatic.form.hook('onChange', function (field, value) {
    if (field.key) {
      this.set(field.key, value);
    }
  });

  formatic.form.hook('on', function () {
    return this.emitter.on.apply(this.emitter, arguments);
  });

  formatic.form.hook('compileField', function (field) {
    return field;
  });

  formatic.form.hook('compile', function (field) {
    return this.compileField(field);
  });

  formatic.form.hook('data', function (value) {
    this.data = value;
  });

  formatic.form.hook('setKey', function (key, value) {
    formatic.setObject(this.data, key, value);
  });

  formatic.form.hook('update', function () {

    var field = this.run(this.root, this.data);

    var props = {form: this, field: field};

    this.emitter.emit('update', props);

    this.updateView(props);
  });

  formatic.form.hook('fieldToObject', function (field, obj) {

    if (field.key) {
      formatic.setObject(obj, field.key, field.value);
    }

    if (field.fields) {
      _.each(field.fields, function (field) {
        this.fieldToObject(field, obj);
      }.bind(this));
    }
  });

  formatic.hook('splitKey', function (key) {
    return key.split('.');
  });

  formatic.hook('getObject', function (obj, key) {

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

  formatic.hook('setObject', function (obj, key, value) {

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

  formatic.form.hook('bindField', function (field, data) {

    field = _.extend({}, field);

    if (field.key) {
      var value = formatic.getObject(data, field.key);
      if (typeof value !== 'undefined') {
        field.value = value;
      }
    }

    return field;
  });

  formatic.form.hook('evalField', function (field, data) {

    var children = field.fields;

    if (children) {
      field.fields = [];

      _.each(children, function (child) {
        field.fields.push(this.runField(child, data));
      }.bind(this));
    }

    return field;
  });

  formatic.form.hook('runField', function (field, data) {

    if (typeof field !== 'object') {
      return null;
    }

    field = this.bindField(field, data);

    field = this.evalField(field, data);

    return field;
  });

  formatic.form.hook('cleanField', function (field) {

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

  formatic.form.hook('run', function (field, data) {

    field = this.runField(field, data);

    field = this.cleanField(field);

    return field;
  });
};

'use strict';

var _ = require('underscore');

module.exports = function (formatic) {

  var fixType = function (field) {
    var typeMap = formatic.options.typeMap;
    if (!typeMap) {
      return;
    }
    if (field.type && field.type in typeMap) {
      field.type = typeMap[field.type];
    }
  };

  var toValue = function (field) {
    if (field.fields && field.fields.length > 0) {
      field.value = field.fields[0];
      if (field.value && field.value.value) {
        field.value = field.value.value;
      }
      field.fields = undefined;
    } else {
      if (typeof field.value === 'undefined') {
        field.value = field.value || null;
      }
    }
  };

  var toFields = function (field) {
    if (typeof field.value !== 'undefined') {
      field.value = undefined;
    }
    field.fields = field.fields || [];
  };

  var types = {};

  formatic.method('type', function (name, methods) {

    if (typeof methods === 'undefined') {
      return types[name];
    }

    var type = formatic.wrappable();
    types[name] = type;

    methods.hasFields = methods.hasFields || false;

    Object.keys(methods).forEach(function (key) {

      var method = methods[key];

      if (typeof method === 'function') {
        type.method(key, method);
      } else {
        // Make a function to return the value.
        type.method(key, function () {
          return method;
        });
      }

    });

    if (type.hasFields()) {
      type.method('initField', toFields);
    } else {
      type.method('initField', toValue);
    }
  });

  formatic.type('default', {});

  formatic.form.replaceMethod('compileField', function (field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.compileField(field);
      }.bind(this));
    }

    field = _.extend({}, field);

    fixType(field);

    var type = formatic.type(field.type) || formatic.type('default');

    type.initField(field);

    if (type.hasMethod('compileField')) {
      return type.compileField(field, this.compileField.bind(this));
    } else {

      var children = field.fields;

      if (children) {
        field.fields = [];

        _.each(children, function (child) {
          field.fields.push(this.compileField(child));
        }.bind(this));
      }

      return field;
    }

  });

  var runField = function (data, field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.runField(field, data);
      }.bind(this));
    }

    return this.runField(field, data);
  };

  formatic.form.replaceMethod('evalField', function (field, data) {

    var type = formatic.type(field.type) || formatic.type('default');

    if (type.hasMethod('evalField')) {

      field = type.evalField(field, data, runField.bind(this, data));
      return field;
    } else {

      var children = field.fields;

      if (children) {
        field.fields = [];

        _.each(children, function (child) {
          field.fields.push(this.runField(child, data));
        }.bind(this));
      }

      return field;
    }
  });
};

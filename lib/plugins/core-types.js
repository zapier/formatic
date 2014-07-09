'use strict';

var _ = require('underscore');

var utils = require('../utils');

module.exports = function (formatic) {

  formatic.hook('type', function (name, type) {

    if (typeof type === 'function') {
      type = type(formatic, name);
    }

    var compile = type.compile;
    var evalField = type.eval;

    if (compile) {
      formatic.hook('compileField_' + name, compile);
    }

    if (evalField) {
      formatic.hook('evalField_' + name, evalField);
    }
  });

  formatic.form.replaceHook('compileField', function (field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.compileField(field);
      }.bind(this));
    }

    field = _.extend({}, field);

    var compileHook = 'compileField_' + field.type;

    if (formatic.hasHook(compileHook)) {
      return formatic[compileHook](field, this.compileField.bind(this));
    } else {
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

  formatic.form.replaceHook('evalField', function (field, data) {

    var evalHook = 'evalField_' + field.type;

    if (formatic.hasHook(evalHook)) {

      field = formatic[evalHook](field, data, runField.bind(this, data));
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

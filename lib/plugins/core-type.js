'use strict';

var _ = require('underscore');

module.exports = function (formatic, plugin) {

  var fixType = function (field) {
    var typeMap = plugin.config.typeMap;
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
    // if (typeof field.value !== 'undefined') {
    //   //field.value = undefined;
    // }
    field.fields = field.fields || [];
  };

  var types = {};

  // Auto register types.
  formatic.onPlugin(function (plugin) {
    if (plugin.name.indexOf('type-') === 0) {
      var type = plugin.name.substring('type-'.length);
      if (plugin.hasFields) {
        plugin.initField = toFields;
      } else {
        plugin.initField = toValue;
      }
      if (!types[type]) {
        types[type] = plugin;
      }
    }
  });

  formatic.type = function (name, methods) {

    if (typeof methods === 'undefined') {
      return types[name];
    }

    // Create a type plugin to be picked up.
    formatic.plugin(function (formatic, plugin) {
      _.extend(plugin, methods);
    }, {name: 'type-' + name});
  };

  formatic.type('default', {});

  formatic.form.compileField = function (field) {

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.compileField(field);
      }.bind(this));
    }

    field = _.extend({}, field);

    fixType(field);

    var type = formatic.type(field.type) || formatic.type('default');

    type.initField(field);

    if (type.compileField) {
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

  };

  var runField = function (ctx, field, index) {

    if (typeof index === 'undefined') {
      index = ctx.index;
    }

    if (_.isArray(field)) {
      return _.map(field, function (field) {
        return this.runField(field, ctx.data, ctx.parentKey, index);
      }.bind(this));
    }

    return this.runField(field, ctx.data, ctx.parentKey, index);
  };

  formatic.form.evalField = function (field, data, parentKey, index) {

    var type = formatic.type(field.type) || formatic.type('default');

    if (type.evalField) {

      field = type.evalField(field, data, runField.bind(this, {
        data: data,
        parentKey: field.key || parentKey,
        index: field.key ? undefined : index
      }));
      return field;
    } else {

      var children = field.fields;

      if (children) {
        field.fields = [];

        _.each(children, function (child, i) {

          field.fields.push(this.runField(child, data, field.key || parentKey, field.key ? i : index));
        }.bind(this));
      }

      return field;
    }
  };
};

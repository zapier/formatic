'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');
var Immutable = require('immutable');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {
    return next();
  });

  formatic.form.val = function (value) {
    if (typeof value === 'undefined') {
      return this.getValue();
    }
    return this.setValue(value);
  };

  formatic.form.getValue = function () {
    if (this.typePlugin().getValue) {
      return this.typePlugin().getValue(this);
    }
    return formatic.toJS(this.getData());
  };

  formatic.form.getData = function () {
    if (this.has('value')) {
      return this.get('value');
    }
    if (!this.has('default')) {
      return null;
    }
    return this.get('default');
  };

  formatic.form.setValue = function (value) {
    if (this.typePlugin().setValue) {
      this.modify(function (form) {
        this.typePlugin().setValue(form, value);
      }.bind(this));
      return this;
    }
    return this.setData(value);
  };

  formatic.form.setData = function (data) {
    this.set('value', data);
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

  formatic.modifyField = function (/*root, current*/) {

  };

  formatic.inflateField = function (root, parent, templateName) {

    var templateMap = parent.child('_templates');

    if (templateMap) {
      var map = templateMap.getData();
      if (map.has(templateName)) {
        return map.get(templateName).deref();
      }
    }

    parent = root.parentFromPath(parent._path);

    if (parent) {
      return formatic.inflateField(root, parent, templateName);
    }

    throw new Error('Template ' + templateName + ' not found.');
  };

  formatic.walkEval = function (root, current) {
    current = current || root;

    var type = current.get('type');

    if (!type) {
      throw new Error('Field must specify type.');
    }

    var typePlugin = formatic.type(type);

    if (!typePlugin) {
      throw new Error('Field must have a valid type.');
    }

    var defaultValue = current.get('default');

    if (typeof defaultValue === 'undefined') {
      defaultValue = typeof typePlugin.default === 'undefined' ? null : typePlugin.default;
      current.set('default', Immutable.fromJS(defaultValue));
    }

    var dataDeps = current.deref('data');

    if (dataDeps) {
      dataDeps.keySeq().forEach(function (propKey) {
        var dataKey = dataDeps.get(propKey);
        var dataField = root.find(dataKey, current);
        if (dataField) {
          var propValue = dataField.val();
          current.set(propKey, propValue);
        }
      });
    }

    formatic.modifyField(root, current);

    if (typePlugin.modifyField) {
      typePlugin.modifyField(root, current);
    }

    var fields = current.get('fields');

    if (!fields) {
      current.set('fields', []);
      fields = current.get('fields');
    }

    fields.forEach(function (field, i) {
      if (_.isString(field)) {
        var inflated = formatic.inflateField(root, current, field);
        fields.set(i, inflated);
      }
    });

    if (fields && fields.length > 0) {
      current.each(function (child) {
        formatic.walkEval(root, child);
      });
    }

    var items = current.get('items');

    // Need to inflate first level so we have any match rules.
    if (items && items.count() > 0) {
      items.forEach(function (field, i) {
        if (_.isString(field)) {
          var inflated = formatic.inflateField(root, current, field);
          items.set(i, inflated);
        }
      });
    }
  };

  formatic.eval = function (form) {
    return form.modify(function (form) {
      formatic.walkEval(form);
    });
  };

  formatic.form.eval = function () {
    return formatic.eval(this);
  };
};

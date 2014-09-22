'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');
var Immutable = require('immutable');

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {
    this._data = null;
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
    return this.getData();
  };

  formatic.form.getData = function () {
    return this._cursor.get('_data') || this.default();
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
    return this.cloneFromCursor(this._cursor.set('_data', data));
  };

  formatic.form.default = function () {
    return this._cursor.get('default');
  };

  var walkCalc = function (root, current) {
    current = current || root;
    var dataDeps = current._cursor.get('data');
    if (dataDeps) {
      _.each(dataDeps.toObject(), function (dataKey, propKey) {
        var dataField = root.find(dataKey, current);
        if (dataField) {
          // current._cursor.updateIn([propKey], function () {
          //   return dataField.val();
          // });
          var propValue = dataField.val();
          var props = {};
          props[propKey] = propValue;
          if (current.typePlugin().getValidProps) {
            props = current.typePlugin().getValidProps(props);
          }
          current._cursor.set(propKey, Immutable.fromJS(props[propKey]));
        }
      });
    }
    var fields = current._cursor.get('fields');
    if (fields && fields.length > 0) {
      current.each(function (child) {
        walkCalc(root, child);
      });
    }
  };

  formatic.calculate = function (form) {
    return form.modify(function (form) {
      walkCalc(form);
    });
  };

  formatic.form.calculate = function () {
    return formatic.calculate(this);
  };
};

'use strict';

var _ = require('underscore');
var Emitter = require('component-emitter');
var objectpath = require('objectpath');

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
};

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
    if (this._type.getValue) {
      return this._type.getValue(this);
    }
    return this.getData();
  };

  formatic.form.getData = function () {
    return this._data || this.default();
  };

  formatic.form.setValue = function (value) {
    if (this._type.setValue) {
      return this._type.setValue(this, value);
    }
    this.setData(value);
    this._emitter.emit('change');
  };

  formatic.form.setData = function (data) {
    this._data = data;
  };

  formatic.form.default = function () {
    return this._default;
  };
};

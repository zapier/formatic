'use strict';

var _ = require('underscore');
var Immutable = require('immutable');
//var Emitter = require('component-emitter');
var Reflux = require('reflux');
var utils = require('../utils');

module.exports = function (formatic) {

  var Field = function () {
    this.init.apply(this, arguments);
  };

  formatic.field = function (a, b, c, d, e, f) {
    return new Field(a, b, c, d, e, f);
  };

  Field.prototype = formatic.field;

  utils.wrappable(Field.prototype);

  Field.prototype.init = function () {};

  formatic.field.wrap('init', function (next, form, fieldState, parents, path) {
    var field = this;

    fieldState = fieldState || form._formState;
    parents = parents || [];
    path = path || '';

    var props = fieldState.remove('fields').toJS();
    _.extend(field, props);

    field._form = form;
    field._fieldState = fieldState;
    field._parents = parents;
    field._path = path;

    return next();
  });

  formatic.field.equals = function (otherField) {
    var field = this;
    if (
      field._form === otherField._form &&
      field._fieldState === otherField._fieldState &&
      field._path === otherField._path
    ) {
      return true;
    }
    return false;
  };

  formatic.field.fields = function () {
    var field = this;

    if (!field._fields) {
      if (!field._fieldState.get('fields')) {
        field._fields = [];
      } else {
        var pathPrefix = field._path;

        if (pathPrefix) {
          pathPrefix += '/';
        }

        field._fields = field._fieldState.get('fields').toArray().map(function (child, i) {
          return formatic.field(field._form, child, field._parents.concat(field), pathPrefix + i);
        });
      }
    }

    return field._fields;
  };

  formatic.field.val = function (value) {
    var field = this;
    field._form._formActions.setValue(field, value);
  };

  formatic.field.valueStatePath = function () {
    var field = this;
    return _.flatten(field._valuePath.map(function (key) {
      return ['value', key];
    }));
  };

  formatic.field.itemState = function (index) {
    return this._fieldState.get('items').get(index);
  };

  formatic.field.parentFieldStates = function () {
    return this._parents.map(function (parent) {
      return parent._fieldState;
    });
  };

  formatic.field.append = function (itemIndex) {
    var field = this;
    field._form._formActions.append(field, itemIndex);
  };

  formatic.field.remove = function (index) {
    var field = this;
    field._form._formActions.remove(field, index);
  };

  formatic.field.move = function (fromIndex, toIndex) {
    var field = this;
    field._form._formActions.move(field, fromIndex, toIndex);
  };

  formatic.form.field = function () {
    if (!this._field || this._field._fieldState !== this._formState) {
      this._field = formatic.field(this);
    }

    return this._field;
  };

};

'use strict';

var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (formatic, plugin) {

  plugin.create = function (actions, form, options) {

    return Reflux.createStore({

      init: function () {
        var store = this;

        store.fields = options.fields || [];
        if (!_.isUndefined(options.value)) {
          store.value = formatic.copyValue(options.value);
        } else {
          store.value = {};
        }
        store.meta = {};
        store.listenToMany(actions);
      },

      inflate: function () {
        var store = this;

        var field = form.field();
        field.inflate(function (path, value) {
          store.value = formatic.setIn(store.value, path, value);
        });
      },

      setValue: function (path, value) {
        var store = this;

        if (_.isUndefined(value)) {
          value = path;
          path = [];
        }
        if (path.length === 0) {
          store.value = formatic.copyValue(value);
          store.inflate();
        } else {
          store.value = formatic.setIn(store.value, path, value);
        }
        store.update();
      },

      removeValue: function (path) {
        var store = this;

        store.value = formatic.removeIn(store.value, path);

        store.update();
      },

      setFields: function (fields) {
        var store = this;

        store.fields = fields;
        store.inflate();

        store.update();
      },

      setMetaItem: function (key, value) {
        this.meta[key] = value;
        this.update();
      },

      update: function () {
        this.trigger({
          value: this.value,
          meta: this.meta,
          fields: this.fields
        });
      }
    });
  };
};

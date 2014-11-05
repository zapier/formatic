'use strict';

var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (plugin) {

  var compiler = plugin.require('compiler');
  var util = plugin.require('util');

  plugin.exports.create = function (actions, form, options) {

    return Reflux.createStore({

      init: function () {
        var store = this;

        store.fields = [];
        store.templateMap = {};
        if (options.fields) {
          store.fields = compiler.expandFields(options.fields);
          store.fields = compiler.compileFields(store.fields);
          store.templateMap = compiler.templateMap(store.fields);
          store.fields = store.fields.filter(function (def) {
            return !def.template;
          });
        }
        if (!_.isUndefined(options.value)) {
          store.value = util.copyValue(options.value);
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
          store.value = util.setIn(store.value, path, value);
        });
      },

      setValue: function (path, value) {
        var store = this;

        if (_.isUndefined(value)) {
          value = path;
          path = [];
        }
        if (path.length === 0) {
          store.value = util.copyValue(value);
          store.inflate();
        } else {
          store.value = util.setIn(store.value, path, value);
        }
        store.update();
      },

      removeValue: function (path) {

        var store = this;

        store.value = util.removeIn(store.value, path);

        store.update();
      },

      // Happens when component is unmounted. Don't want to trigger update for
      // this.
      eraseValue: function (path) {

        var store = this;

        store.value = util.removeIn(store.value, path);
      },

      appendValue: function (path, value) {
        var store = this;

        store.value = util.appendIn(store.value, path, value);

        store.update();
      },

      moveValue: function (path, fromKey, toKey) {
        var store = this;

        store.value = util.moveIn(store.value, path, fromKey, toKey);

        store.update();
      },

      setFields: function (fields) {
        var store = this;

        store.fields = fields;
        store.inflate();

        store.update();
      },

      setMeta: function (key, value) {
        var store = this;

        store.meta[key] = value;
        store.update();
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

'use strict';

var _ = require('underscore');

module.exports = function (plugin) {

  var compiler = plugin.require('compiler');
  var util = plugin.require('util');

  plugin.exports = function (form, emitter, options) {

    var store = {};

    store.fields = [];
    store.templateMap = {};
    store.value = {};
    store.meta = {};

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
    }

    var update = function () {
      emitter.emit('change', {
        value: store.value,
        meta: store.meta,
        fields: store.fields
      });
    };

    store.inflate = function () {
      var field = form.field();
      field.inflate(function (path, value) {
        value = util.setIn(store.value, path, value);
      });
    };

    var actions = {

      setValue: function (path, value) {

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
        update();
      },

      removeValue: function (path) {

        store.value = util.removeIn(store.value, path);

        update();
      },

      // Happens when component is unmounted. Don't want to trigger update for
      // this.
      eraseValue: function (path) {

        store.value = util.removeIn(store.value, path);
      },

      appendValue: function (path, value) {
        store.value = util.appendIn(store.value, path, value);

        update();
      },

      moveValue: function (path, fromKey, toKey) {
        store.value = util.moveIn(store.value, path, fromKey, toKey);

        update();
      },

      setFields: function (fields) {
        store.fields = fields;
        store.inflate();

        update();
      },

      setMeta: function (key, value) {
        store.meta[key] = value;
        update();
      }
    };

    _.extend(store, actions);

    return store;
  };
};

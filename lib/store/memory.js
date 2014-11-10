// # store.memory

/*
The memory store plugin keeps the state of fields, data, and metadata. It
responds to actions and emits a change event if there are any changes.
*/

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

    // Helper to setup fields. Field definitions need to be expanded, compiled,
    // etc.
    var setupFields = function (fields) {
      store.fields = compiler.expandFields(fields);
      store.fields = compiler.compileFields(store.fields);
      store.templateMap = compiler.templateMap(store.fields);
      store.fields = store.fields.filter(function (def) {
        return !def.template;
      });
    };

    if (options.fields) {
      setupFields(options.fields);
    }

    if (!_.isUndefined(options.value)) {
      store.value = util.copyValue(options.value);
    }

    // Currently, just a single event for any change.
    var update = function () {
      emitter.emit('change', {
        value: store.value,
        meta: store.meta,
        fields: store.fields
      });
    };

    // When fields change, we need to "inflate" them, meaning expand them and
    // run any evaluations in order to get the default value out.
    store.inflate = function () {
      var field = form.field();
      field.inflate(function (path, value) {
        store.value = util.setIn(store.value, path, value);
      });
    };

    var actions = {

      // Set value at a path.
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

      // Remove a value at a path.
      removeValue: function (path) {

        store.value = util.removeIn(store.value, path);

        update();
      },

      // Erase a value. User actions can remove values, but nodes can also
      // disappear due to changing evaluations. This action occurs automatically
      // (and may be unnecessary if the value was already removed).
      eraseValue: function (path) {

        store.value = util.removeIn(store.value, path);

        update();
      },

      // Append a value to an array at a path.
      appendValue: function (path, value) {
        store.value = util.appendIn(store.value, path, value);

        update();
      },

      // Swap values of two keys.
      moveValue: function (path, fromKey, toKey) {
        store.value = util.moveIn(store.value, path, fromKey, toKey);

        update();
      },

      // Change all the fields.
      setFields: function (fields) {
        setupFields(fields);
        store.inflate();

        update();
      },

      // Set a metadata value for a key.
      setMeta: function (key, value) {
        store.meta[key] = value;
        update();
      }
    };

    _.extend(store, actions);

    return store;
  };
};

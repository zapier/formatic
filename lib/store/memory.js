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

    var update = function (changing) {
      emitter.emit('change', {
        value: store.value,
        meta: store.meta,
        fields: store.fields,
        changing: changing
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

    store.metaKeys = function () {
      return Object.keys(store.meta);
    };

    store.getMeta = function (key) {
      if (store.meta[key] && store.meta[key].status === 'loaded') {
        return store.meta[key].value;
      }
      return null;
    };

    store.getMetaStatus = function (key) {
      return (store.meta[key] && store.meta[key].status) || 'unknown';
    };

    var actions = {

      setFormValue: function (value) {
        var oldValue = store.value;
        store.value = util.copyValue(value);
        store.inflate();
        update({new: value, old: oldValue, action: 'reset'});
      },

      // Set value at a path.
      setValue: function (field, value) {
        var path = field.valuePath();

        var oldValue = util.getIn(store.value, path);

        store.value = util.setIn(store.value, path, value);

        update({field: field.def, path: path, new: value, old: oldValue, action: 'set'});
      },

      // Remove a value at a path.
      removeValue: function (field, key) {
        var path = field.valuePath().concat(key);

        var oldValue = util.getIn(store.value, path);
        store.value = util.removeIn(store.value, path);

        update({field: field.def, path: path, old: oldValue, action: 'remove'});
      },

      // Stopped using this, but leaving it here for now. Was bad idea to
      // automatically erase values. But might find a better way to do this in
      // the future.
      eraseValue: function (field) {
        var path = field.valuePath();

        store.value = util.removeIn(store.value, path);

        update({field: field.def});
      },

      // Append a value to an array at a path.
      appendValue: function (field, value) {
        var path = field.valuePath();

        var oldValue = util.getIn(store.value, path);
        store.value = util.appendIn(store.value, path, value);

        update({field: field.def, path: path, new: value, old: oldValue, action: 'append'});
      },

      // Swap values of two keys.
      moveValue: function (field, fromKey, toKey) {
        var path = field.valuePath();

        var oldValue = util.getIn(store.value, path);
        store.value = util.moveIn(store.value, path, fromKey, toKey);

        update({field: field.def, path: path, new: oldValue, old: oldValue, fromKey: fromKey, toKey: toKey, action: 'move'});
      },

      // Change all the fields.
      setFields: function (fields) {
        setupFields(fields);
        store.inflate();

        update({action: 'setFields'});
      },

      // Set a metadata value for a key. Optionally set status.
      setMeta: function (key, value, status) {
        status = status || 'loaded';
        store.meta[key] = {
          value: value,
          status: status
        };
        update({action: 'setMeta'});
      }
    };

    _.extend(store, actions);

    return store;
  };
};

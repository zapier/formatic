// # Core form plugin (core.form)

/*
The core form plugin supplies methods that get added to the Form prototype.
*/

'use strict';

var _ = require('underscore');
var EventEmitter = require('eventemitter3');

module.exports = function (plugin) {

  var proto = plugin.exports;

  // Get the store plugin.
  var createStore = plugin.require(plugin.config.store);

  var util = plugin.require('util');
  var loader = plugin.require('loader');

  // Helper to create actions, which will tell the store that something has
  // happened. Note that actions go straight to the store. No events,
  // dispatcher, etc.
  var createSyncActions = function (store, names) {
    var actions = {};
    names.forEach(function (name) {
      actions[name] = function () {
        store[name].apply(store, arguments);
      };
    });
    return actions;
  };

  // Initialize the form instance.
  proto.init = function (options) {
    var form = this;

    options = options || {};

    // Need an emitter to emit change events from the store.
    var storeEmitter = new EventEmitter();

    // Create a store.
    form.store = createStore(form, storeEmitter, options);

    // Create the actions to notify the store of changes.
    form.actions = createSyncActions(form.store, ['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue', 'eraseValue', 'setMeta']);

    // Seed the value from any fields.
    form.store.inflate();

    // Add on/off to get change events from form.
    form.on = storeEmitter.on.bind(storeEmitter);
    form.off = storeEmitter.off.bind(storeEmitter);
  };

  // Get the root component for a form.
  proto.component = function (props) {

    var form = this;

    props = _.extend({}, props, {
      form: form
    });

    var component = plugin.component('formatic');

    return component(props);
  };

  // Get or set the value of a form.
  proto.val = function (value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setValue(value);
    }

    return util.copyValue(form.store.value);
  };

  // Set the fields for a form.
  proto.fields = function (fields) {
    var form = this;

    form.actions.setFields(fields);
  };

  proto.findDef = function (key) {
    var form = this;

    return form.store.templateMap[key] || null;
  };

  proto.meta = function (key, value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setMeta(key, value);
    }

    return form.store.meta[key];
  };

  proto.loadMeta = function (keys) {
    var validKeys = keys.filter(function (key) {
      return key;
    });
    if (validKeys.length < keys.length) {
      return;
    }
    loader.loadMeta(this, keys);
  };

  proto.source = loader.source;
};

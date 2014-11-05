'use strict';

var Reflux = require('reflux');
var _ = require('underscore');

module.exports = function (plugin) {

  var proto = plugin.exports;

  var storePlugin = plugin.require(plugin.config.store);
  var util = plugin.require('util');
  var loader = plugin.require('loader');

  var createSyncActions = function (names) {
    var actions = {};
    names.forEach(function (name) {
      actions[name] = Reflux.createAction({sync: true});
    });
    return actions;
  };

  proto.init = function (options) {
    var form = this;

    options = options || {};

    //form.actions = Reflux.createActions(['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue']);
    form.actions = createSyncActions(['setValue', 'setFields', 'removeValue', 'appendValue', 'moveValue', 'eraseValue', 'setMeta']);
    form.store = storePlugin.create(form.actions, form, options);
    form.store.inflate();

    form.contextifiers = {};
  };

  proto.component = function () {

    var form = this;

    var component = plugin.component('formatic');

    return component({
      form: form
    });
  };

  proto.val = function (value) {
    var form = this;

    if (!_.isUndefined(value)) {
      return form.actions.setValue(value);
    }

    return util.copyValue(form.store.value);
  };

  proto.fields = function (fields) {
    var form = this;

    form.actions.setFields(fields);
  };

  proto.findDef = function (key) {
    var form = this;

    return form.store.templateMap[key] || null;
  };

  proto.contextifier = function (key, contextify) {
    var form = this;

    form.contextifiers[key] = contextify;
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

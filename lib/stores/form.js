'use strict';

var Reflux = require('reflux');

module.exports = function (formatic, plugin) {

  plugin.create = function (actions, formState, metaStore) {

    return Reflux.createStore({

      init: function () {
        this.formState = formState;
        this.templateMap = {};

        this.listenToMany(actions);
        this.listenTo(metaStore, this.onMetaStoreChanged);
      },

      onSetFormValue: function (value) {
        this.formState = formatic.setFieldValue(this.formState, value, this.templateMap);
        this.trigger(this.formState);
      },

      onSetValue: function (field, value) {
        this.formState = formatic.setValueOfField(this.formState, field, value);
        this.trigger(this.formState);
      },

      onAppend: function (field, item) {
        this.formState = formatic.appendField(this.formState, field, item, this.templateMap);
        this.trigger(this.formState);
      },

      onRemove: function (field, index) {
        this.formState = formatic.removeField(this.formState, field, index);
        this.trigger(this.formState);
      },

      onMove: function (field, fromIndex, toIndex) {
        this.formState = formatic.moveField(this.formState, field, fromIndex, toIndex);
        this.trigger(this.formState);
      },

      onMetaStoreChanged: function (data) {
        // Later, may want to trigger on this. For now, just assuming one set.
        this.templateMap = data._templateMap;
      },

      getDefaultData: function () {
        return this.formState;
      }

    });
  };
};

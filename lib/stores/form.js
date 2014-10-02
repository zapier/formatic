'use strict';

var Reflux = require('reflux');

module.exports = function (formatic, plugin) {

  plugin.create = function (actions, formState, metaStore) {

    return Reflux.createStore({

      init: function () {
        //this.history = [];
        this.formState = formState;
        this.templateMap = {};
        this.metaData = {};

        this.listenToMany(actions);
        this.listenTo(metaStore, this.onMetaStoreChanged);
      },

      onSetFormValue: function (value) {
        this.update(formatic.setFieldValue(this.formState, value, this.templateMap));
      },

      onSetValue: function (field, value) {
        this.update(formatic.setValueOfField(this.formState, field, value));
      },

      onAppend: function (field, item) {
        this.update(formatic.appendField(this.formState, field, item, this.templateMap));
      },

      onRemove: function (field, index) {
        this.update(formatic.removeField(this.formState, field, index));
      },

      onMove: function (field, fromIndex, toIndex) {
        this.update(formatic.moveField(this.formState, field, fromIndex, toIndex));
      },

      onMetaStoreChanged: function (data) {
        // Later, may want to trigger on this. For now, just assuming one set.
        this.templateMap = data._templateMap;
        this.metaData = data;

        this.update();
      },

      onUndo: function () {
        // if (this.history.length > 0) {
        //   this.formState = this.history.pop();
        //   this.trigger(this.formState);
        // }
      },

      getDefaultData: function () {
        return this.formState;
      },

      update: function (formState) {
        formState = formState || this.formState;
        var newFormState = formatic.updateData(formState, this.metaData);
        if (!newFormState.equals(this.formState)) {
          //this.history.push(this.formState);
          this.formState = newFormState;
          this.trigger(this.formState);
        }
      }

    });
  };
};

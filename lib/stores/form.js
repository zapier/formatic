'use strict';

var Reflux = require('reflux');
var Immutable = require('immutable');

module.exports = function (formatic, plugin) {

  plugin.create = function (actions, metaStore, form) {

    return Reflux.createStore({

      init: function () {
        this.form = form;
        this.rootValue = form._currentValue;
        this.staticFormState = form._formState;
        this.dynamicFormState = form._dynamicFormState;
        this.meta = {};

        this.listenToMany(actions);
        this.listenTo(metaStore, this.onMetaStoreChanged);
      },

      onReplaceForm: function (dynamicFormDef) {
        this.updateForm(formatic.fromJS(dynamicFormDef));
      },

      onSetFormValue: function (value) {
        var formState = formatic.eval(form, this.dynamicFormState, null, this.meta);
        var cleanValue = formatic.fromJS(formatic.valueOfFieldState(formState));
        value = cleanValue.mergeDeep(value);
        if (value.toJS) {
          value = value.toJS();
        }
        value = formatic.wrapValue(value);
        value = formatic.fromJS(value);
        this.updateValue(value);
      },

      onSetValue: function (field, value) {
        this.updateValue(formatic.setValueOfField(this.rootValue, field, value));
      },

      onAppend: function (field, itemIndex) {
        this.updateValue(formatic.appendField(this.rootValue, field, itemIndex));
      },

      onRemove: function (field, index) {
        this.updateValue(formatic.removeField(this.rootValue, field, index));
      },

      onMove: function (field, fromIndex, toIndex) {
        this.updateValue(formatic.moveField(this.rootValue, field, fromIndex, toIndex));
      },

      onMetaStoreChanged: function (data) {
        this.meta = data;

        this.update();
      },

      onUndo: function () {
        // if (this.history.length > 0) {
        //   this.formState = this.history.pop();
        //   this.trigger(this.formState);
        // }
      },

      getDefaultData: function () {
        return {
          dynamicFormState: this.dynamicFormState,
          value: this.rootValue,
          meta: this.meta
        };
      },

      updateForm: function (dynamicFormState) {
        this.update(
          dynamicFormState,
          this.rootValue
        );
      },

      updateValue: function (value) {
        this.update(
          this.dynamicFormState,
          value
        );
      },

      update: function (dynamicFormState, value) {
        this.dynamicFormState = dynamicFormState || this.dynamicFormState;
        this.rootValue = value || this.rootValue;

        this.trigger({
          dynamicFormState: this.dynamicFormState,
          value: this.rootValue,
          meta: this.meta
        });
        // formState = formState || this.formState;
        // var newFormState = formatic.updateData(formState, this.metaData);
        // if (!newFormState.equals(this.formState)) {
        //   //this.history.push(this.formState);
        //   this.formState = newFormState;
        //   this.trigger(this.formState);
        // }
      }

    });
  };
};

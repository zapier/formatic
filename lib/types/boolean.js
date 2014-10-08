'use strict';

module.exports = function (formatic, plugin) {

  plugin.default = false;

  // plugin.modifyField = function (field) {
  //   if (!field.choices) {
  //     field.choices = [
  //       {value: 'true', label: 'Yes'},
  //       {value: 'false', label: 'No'}
  //     ];
  //   }
  // };

  plugin.normalizeField = function (fieldState) {
    if (!fieldState.get('choices')) {
      return fieldState.set('choices', formatic.fromJS([
        {value: 'true', label: 'Yes'},
        {value: 'false', label: 'No'}
      ]));
    }
    return fieldState;
  };

  plugin.getFieldValue = function (field) {

    var value = field.get('value');

    if (!value) {
      return false;
    }

    if (typeof value === 'string') {
      value = value.toLowerCase();
    }

    if (value === 'false' || value === 'no') {
      return false;
    }

    return value ? true : false;
  };

  plugin.setFieldValue = function (fieldState, value) {
    if (!value) {
      return fieldState.set('value', false);
    }

    if (typeof value === 'string') {
      value = value.toLowerCase();
    }

    if (value === 'false' || value === 'no') {
      return fieldState.set('value', false);
    }

    return value ? fieldState.set('value', true) : fieldState.set('value', false);
  };
};

'use strict';

module.exports = function (formatic, plugin) {

  plugin.evalField = function (field, data) {

    return {
      type: 'value',
      value: formatic.getObject(data, field.value)
    };
  };
};

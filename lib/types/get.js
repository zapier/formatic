'use strict';

module.exports = function (formatic) {

  return {

    eval: function (field, data) {

      return {
        type: 'value',
        value: formatic.getObject(data, field.value)
      };
    }
  };
};

'use strict';

module.exports = function (formatic, typeName) {

  formatic.type(typeName, {

    evalField: function (field, data) {

      return {
        type: 'value',
        value: formatic.getObject(data, field.value)
      };
    }
  });
};

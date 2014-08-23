'use strict';

module.exports = function (formatic, config) {

  formatic.type(config.type, {

    evalField: function (field, data) {

      return {
        type: 'value',
        value: formatic.getObject(data, field.value)
      };
    }
  });
};

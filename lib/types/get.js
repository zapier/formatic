'use strict';

module.exports = function (formatic, plugin) {

  formatic.type(plugin.config.type, {

    evalField: function (field, data) {

      return {
        type: 'value',
        value: formatic.getObject(data, field.value)
      };
    }
  });
};

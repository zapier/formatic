'use strict';

module.exports = function (formatic, typeName) {

  formatic.type(typeName, {

    hasFields: true,

    evalField: function (field, data, run) {

      var fields = run(field.fields);

      return {
        type: 'value',
        value: fields[0].value === fields[1].value
      };
    }
  });
};

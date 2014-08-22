'use strict';

module.exports = function (formatic, typeName) {

  formatic.type(typeName, {

    hasFields: true,

    evalField: function (field, data, run) {

      var test = run(field.fields[0]);

      if (test.value) {
        return run(field.fields[1]);
      } else {
        return run(field.fields[2]);
      }
    }
  });
};

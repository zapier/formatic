'use strict';

module.exports = {

  eval: function (field, data, run) {

    var fields = run(field.fields);

    return {
      type: 'value',
      value: fields[0].value === fields[1].value
    };
  }
};

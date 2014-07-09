'use strict';

var utils = require('../utils');

module.exports = {

  eval: function (field, data) {

    return {
      type: 'value',
      value: utils.getObject(data, field.value)
    };
  }
};

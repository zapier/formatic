'use strict';

module.exports = function (formatic) {

  var types = {};

  formatic.type = function (name, type) {
    types[name] = type;
  };

  return function (form) {

    return function (field) {

      if (!types[field.type]) {
        throw new Error('No type: ' + field.type);
      }

      if (types[field.type] && types[field.type].init) {
        types[field.type].init(field);
      }

      return field;
    };

  };
};

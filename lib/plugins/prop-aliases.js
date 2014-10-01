'use strict';

var _ = require('underscore');

var aliases = {
  help_text: 'helpText'
};

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, field) {

    Object.keys(aliases).forEach(function (alias) {
      var propName = aliases[alias];
      if (typeof field[propName] === 'undefined' && typeof field[alias] !== 'undefined') {
        field[propName] = field[alias];
      }
    });

    return next();
  });
};

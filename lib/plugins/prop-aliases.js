'use strict';

var aliases = {
  help_text: 'helpText'
};

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, root, current) {

    Object.keys(aliases).forEach(function (alias) {
      var propName = aliases[alias];
      if (!current.has(propName) && current.has(alias)) {
        current.set(propName, current.get(alias));
      }
    });

    return next();
  });
};

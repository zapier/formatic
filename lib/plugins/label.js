'use strict';

module.exports = function (formatic) {

  formatic.wrap('modifyField', function (next, root, current) {

    if (!current.get('label')) {
      if (current.get('key')) {
        current.set('label', formatic.humanize(current.get('key')));
      }
    }

    return next();
  });
};

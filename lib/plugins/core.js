'use strict';

module.exports = function (formatic) {

  formatic.plugin(require('./core-data'));
  formatic.plugin(require('./core-type'));
  formatic.plugin(require('./core-types'));
  formatic.plugin(require('./core-view'));
};

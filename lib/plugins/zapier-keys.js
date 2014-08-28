'use strict';

module.exports = function (formatic) {
  
  formatic.replaceMethod('splitKey', function (key) {
    return [key];
    //return key.split('__');
  });
};

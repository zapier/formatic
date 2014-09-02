'use strict';

module.exports = function (formatic) {

  formatic.splitKey = function (key) {
    return [key];
    //return key.split('__');
  };
};

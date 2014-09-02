'use strict';

module.exports = function (formatic) {

  formatic.form.wrap('init', function (next) {

    this.metadata = {};

    return next();
  });

  formatic.form.setMeta = function (key, value) {
    this.metadata[key] = value;
  };

  formatic.form.getMeta = function (key) {
    if (key in this.metadata) {
      return this.metadata[key];
    }
    return null;
  };

  formatic.form.meta = function (key, value) {
    if (arguments.length === 1) {
      return this.getMeta(key);
    } else {
      return this.setMeta(key, value);
    }
  };
};

'use strict';

var Reflux = require('reflux');

module.exports = function (formatic, plugin) {

  plugin.create = function (actions) {

    return Reflux.createStore({
      init: function () {
        this.listenToMany(actions);
      }
    });
  };
};

'use strict';

var Reflux = require('reflux');

module.exports = function (formatic, plugin) {

  plugin.create = function (actions) {

    return Reflux.createStore({

      init: function () {
        this.data = {};

        this.listenTo(actions.setItem, this.setItem);
      },

      setItem: function (key, value) {
        this.data[key] = value;
        this.trigger(this.data);
      },

      getDefaultData: function () {
        return this.data;
      }

    });
  };
};
